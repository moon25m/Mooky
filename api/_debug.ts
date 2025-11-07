import { getDb } from './_lib/db';
import { sanitizeDbUrl } from './_lib/url-sanitize';

export const config = { runtime: 'edge' } as const;

export default async function handler(req: Request) {
  const headerPass = (req.headers.get('x-admin-pass') || '').trim();
  if (process.env.NODE_ENV === 'production') {
    const expected = process.env.MOOKY_ADMIN_PASS || '';
    if (!expected || headerPass !== expected) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const env = {
    database: !!process.env.DATABASE_URL,
    adminPass: !!process.env.MOOKY_ADMIN_PASS,
    nextPublicAdmin: !!process.env.NEXT_PUBLIC_MOOKY_ADMIN_PASS
  };

  if (!process.env.DATABASE_URL) {
    return json({ ok: true, env, dbCount: null });
  }

  try {
    const url = sanitizeDbUrl(process.env.DATABASE_URL);
    if (!url) return json({ ok: false, env, dbCount: null, error: 'DATABASE_URL invalid' }, { status: 400 });
    const sql = getDb();
    const cnt = await sql`select count(*)::int as n from wishes` as any;
    const n = cnt?.[0]?.n ?? null;
    return json({ ok: true, env, dbCount: n });
  } catch (e: any) {
    try { console.error('[debug] db check failed', e?.message || e); } catch {}
    return json({ ok: false, env, dbCount: null, error: String(e?.message || e) }, { status: 500 });
  }
}

function json(obj: any, init: ResponseInit = {}) {
  return new Response(JSON.stringify(obj), { ...init, headers: { 'content-type': 'application/json', ...(init.headers || {}) } });
}
