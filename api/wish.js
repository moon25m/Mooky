// Node.js Serverless Function for creating a wish (CommonJS)
// Endpoint: POST /api/wish
// - Validates JSON body { name?, message }
// - Inserts into Postgres (Neon) using parameterized SQL
// - Returns 201 with { ok: true, id }

const { neon } = require('@neondatabase/serverless');
const { randomUUID } = require('crypto');
const { pusher, CHANNEL, EVENTS } = require('./_lib/pusher');
function sanitizeDbUrl(raw) {
  if (!raw) return '';
  let s = String(raw).trim();
  s = s.replace(/^psql\s+/, '');
  s = s.replace(/^['"]|['"]$/g, '');
  return s;
}

function send(res, status, body) {
  res.status(status).setHeader('content-type', 'application/json').send(JSON.stringify(body));
}

async function readRawBody(req) {
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buf = Buffer.isBuffer(chunks[0]) ? Buffer.concat(chunks) : Buffer.from(chunks.join(''));
    return buf.toString('utf8');
  } catch {
    return '';
  }
}

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const url = sanitizeDbUrl(process.env.DATABASE_URL);
      if (!url || !/^postgres(ql)?:\/\//i.test(url)) {
        return send(res, 503, { ok: false, error: 'DATABASE_URL not configured' });
      }
      const sql = neon(url);
      const rows = await sql`select id, name, message, created_at from wishes order by created_at desc`;
      res.setHeader('cache-control', 'no-store, no-cache, must-revalidate');
      return send(res, 200, { wishes: rows });
    } catch (err) {
      return send(res, 500, { ok: false, error: err?.message || 'failed' });
    }
  }
  if (req.method !== 'POST') {
    return send(res, 405, { ok: false, error: 'Method not allowed' });
  }

  const requestId = req.headers?.['x-vercel-id'] || req.headers?.['x-request-id'] || undefined;

  try {
    const url = sanitizeDbUrl(process.env.DATABASE_URL);
    if (!url) {
      console.error('POST /api/wish env-missing', { requestId });
      return send(res, 503, { ok: false, error: 'DATABASE_URL is not configured on the server' });
    }
    if (!/^postgres(ql)?:\/\//i.test(url)) {
      return send(res, 503, { ok: false, error: 'DATABASE_URL is not a valid postgres URL' });
    }

    // Parse JSON body safely (may be undefined, string, Buffer, object, or stream)
    let body = req.body;
    if (!body) {
      const raw = await readRawBody(req);
      try { body = raw ? JSON.parse(raw) : {}; } catch { body = {}; }
    } else if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    } else if (Buffer.isBuffer(body)) {
      try { body = JSON.parse(body.toString('utf8')); } catch { body = {}; }
    }
    if (!body || typeof body !== 'object') body = {};

    const name = String((body.name ?? '')).slice(0, 80).trim() || 'Anonymous';
    const messageOriginal = String((body.message ?? ''));
    const message = messageOriginal.trim();

    if (!message) return send(res, 400, { ok: false, error: 'Message required' });
    if (message.length > 500) return send(res, 400, { ok: false, error: 'Message too long (max 500)' });

    console.info('POST /api/wish', { requestId, len: message.length });

    const sql = neon(url);
    const id = randomUUID();

    const rows = await sql`insert into wishes (id, name, message) values (${id}, ${name}, ${message}) returning id, name, message, created_at`;

    // Broadcast via Pusher if configured
    try {
      if (pusher) {
        const payload = rows?.[0] || { id, name, message, created_at: new Date().toISOString() };
        await pusher.trigger(CHANNEL, EVENTS.NEW, payload);
      }
    } catch (e) {
      console.warn('[pusher] trigger failed:', e?.message || e);
    }

    return send(res, 201, { ok: true, id });
  } catch (err) {
    console.error('POST /api/wish', { error: err?.message || String(err) });
    return send(res, 500, { ok: false, error: err?.message || 'Server error' });
  }
};
