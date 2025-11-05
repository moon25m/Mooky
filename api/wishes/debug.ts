import { getDb } from '../_lib/db';
import { sanitizeDbUrl } from '../_lib/url-sanitize';

export const config = { runtime: 'edge' } as const;

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
  const url = sanitizeDbUrl(process.env.DATABASE_URL);
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
