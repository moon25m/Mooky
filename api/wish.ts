// Node.js serverless API for creating a single wish
// Endpoint: POST /api/wish
// - Validates JSON body { name?, message }
// - Inserts row into Postgres (Neon) using parameterized SQL
// - Returns 201 with { ok: true, id }

import { neon } from '@neondatabase/serverless';

// Ensure this runs in Node.js (not Edge) on Vercel
// Edge can have stricter streaming/body limitations and different fetch/crypto behavior.
export const config = { runtime: 'nodejs' };

type Req = any; // Avoid depending on @vercel/node types for portability
type Res = any;

function send(res: Res, status: number, body: any) {
  res.status(status).setHeader('content-type', 'application/json').send(JSON.stringify(body));
}

async function readRawBody(req: Req): Promise<string> {
  try {
    const chunks: any[] = [];
    for await (const chunk of req) chunks.push(chunk);
    const buf = Buffer.isBuffer(chunks[0]) ? Buffer.concat(chunks as Buffer[]) : Buffer.from(chunks.join(''));
    return buf.toString('utf8');
  } catch {
    return '';
  }
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    return send(res, 405, { ok: false, error: 'Method not allowed' });
  }

  const requestId = req.headers?.['x-vercel-id'] || req.headers?.['x-request-id'] || undefined;

  try {
    const url = process.env.DATABASE_URL;
    if (!url) {
      console.error('POST /api/wish env-missing', { requestId });
      return send(res, 503, { ok: false, error: 'DATABASE_URL is not configured on the server' });
    }

    // Parse JSON body safely (Vercel/node may give undefined, string, object, or stream)
    let body: any = req.body;
    if (!body) {
      const raw = await readRawBody(req);
      try { body = raw ? JSON.parse(raw) : {}; } catch { body = {}; }
    } else if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    } else if (Buffer.isBuffer(body)) {
      try { body = JSON.parse(body.toString('utf8')); } catch { body = {}; }
    }
    if (!body || typeof body !== 'object') body = {};

    const name = String((body.name ?? '').toString()).slice(0, 80).trim() || 'Anonymous';
    const messageOriginal = String((body.message ?? '').toString());
    const message = messageOriginal.trim();

    // Validation
    if (!message) return send(res, 400, { ok: false, error: 'Message required' });
    if (message.length > 500) return send(res, 400, { ok: false, error: 'Message too long (max 500)' });

    console.info('POST /api/wish', { requestId, len: message.length });

  const sql = neon(url);
  const id = (globalThis.crypto?.randomUUID?.() ?? require('crypto').randomUUID());

    // Parameterized insert; relies on server default for created_at
    await sql`insert into wishes (id, name, message) values (${id}, ${name}, ${message})`;

    return send(res, 201, { ok: true, id });
  } catch (err: any) {
    console.error('POST /api/wish', { error: err?.message || String(err) });
    return send(res, 500, { ok: false, error: err?.message || 'Server error' });
  }
}
