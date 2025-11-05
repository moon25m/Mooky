// Node.js Serverless Function for creating a wish (CommonJS)
// Endpoint: GET/POST /api/wish
// - Validates JSON body { name?, message }
// - Inserts into Postgres (Neon) using parameterized SQL
// - Returns 201 with { ok: true, data: row }
// - GET returns latest 100 with Cache-Control: no-store

const { neon } = require('@neondatabase/serverless');
const { randomUUID } = require('crypto');

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
  const method = (req.method || 'GET').toUpperCase();

  const requestId = req.headers?.['x-vercel-id'] || req.headers?.['x-request-id'] || undefined;

  try {
    const url = process.env.DATABASE_URL;
    if (!url) {
      console.error(method + ' /api/wish env-missing', { requestId });
      return send(res, 503, { ok: false, error: 'DATABASE_URL is not configured on the server' });
    }
    const sql = neon(url);

    if (method === 'GET') {
      // Ensure table exists (idempotent)
      await sql`create table if not exists wishes (
        id text primary key,
        name text not null,
        message text not null,
        created_at timestamptz not null default now()
      )`;
      const rows = await sql`select id, name, message, created_at from wishes order by created_at desc limit 100`;
      res.setHeader('cache-control', 'no-store, no-cache, must-revalidate');
      return send(res, 200, { ok: true, data: rows });
    }

    // POST
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

    const id = randomUUID();
    const rows = await sql`insert into wishes (id, name, message) values (${id}, ${name}, ${message}) returning id, name, message, created_at`;
    return send(res, 201, { ok: true, data: rows?.[0] });
  } catch (err) {
    console.error(method + ' /api/wish', { error: err?.message || String(err) });
    return send(res, 500, { ok: false, error: err?.message || 'Server error' });
  }
};
