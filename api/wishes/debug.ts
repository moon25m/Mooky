import { neon } from '@neondatabase/serverless';

export const runtime = 'edge';

function json(obj: any, init: ResponseInit = {}) {
  return new Response(JSON.stringify(obj), { ...init, headers: { 'content-type': 'application/json', ...(init.headers||{}) } });
}

export default async function handler(_req: Request) {
  try {
    const url = process.env.DATABASE_URL;
    if (!url) return json({ ok: false, error: 'DATABASE_URL not set on server' }, { status: 502 });

    // Mask the URL for safety; show only host
    let host = 'unknown';
    try { host = new URL(url).host; } catch {}

    const sql = neon(url);
    try {
      // quick check: count rows
      const rows = await sql`select count(*)::int as c from wishes`;
      const count = Array.isArray(rows) && rows[0] && typeof rows[0].c !== 'undefined' ? rows[0].c : null;
      return json({ ok: true, dbHost: host, count });
    } catch (e: any) {
      return json({ ok: false, dbHost: host, error: String(e?.message || e) }, { status: 500 });
    }
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message || e) }, { status: 500 });
  }
}
import { getDb } from '../_lib/db';

export const runtime = 'edge';

function mask(url?: string) {
  if (!url) return '';
  try {
    const u = new URL(url);
    const host = u.host;
    const db = u.pathname.replace('/', '');
    return `${host}/${db}`;
  } catch { return 'unparseable-url'; }
}

export default async function handler(_req: Request) {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return json({ ok: false, error: 'DATABASE_URL is not set in Vercel environment.' }, { status: 503 });
  }
  try {
    const sql = getDb();
    // simple connectivity test
    const test = await sql`select 1 as ok` as any;
    // table existence and count
    const exists = await sql`select to_regclass('public.wishes') as t` as any;
    const tableExists = !!(exists?.[0]?.t);
    let rowCount = 0;
    if (tableExists) {
      const c = await sql`select count(*)::int as n from wishes` as any;
      rowCount = c?.[0]?.n ?? 0;
    }
    return json({ ok: true, target: mask(url), ping: test?.[0]?.ok === 1, tableExists, rowCount });
  } catch (e: any) {
    return json({ ok: false, error: e?.message || 'connection failed', target: mask(url) }, { status: 500 });
  }
}

function json(obj: any, init: ResponseInit = {}) {
  return new Response(JSON.stringify(obj), { ...init, headers: { 'content-type': 'application/json', ...(init.headers || {}) } });
}
