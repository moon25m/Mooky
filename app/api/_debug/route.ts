export const runtime = 'edge';

// Admin-only debug endpoint. Call with header `x-admin-pass: <MOOKY_ADMIN_PASS>`
// in production. Returns presence of env vars and a lightweight non-destructive
// count of rows in `wishes` when DATABASE_URL is configured.
export async function GET(req: Request) {
  const headerPass = req.headers.get('x-admin-pass') || '';
  if (process.env.NODE_ENV === 'production') {
    const expected = process.env.MOOKY_ADMIN_PASS || '';
    if (!expected || headerPass !== expected) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type':'application/json' } });
    }
  }

  const env = {
    database: !!process.env.DATABASE_URL,
    adminPass: !!process.env.MOOKY_ADMIN_PASS,
    nextPublicAdmin: !!process.env.NEXT_PUBLIC_MOOKY_ADMIN_PASS
  };

  // If no database URL, return early with env info
  if (!process.env.DATABASE_URL) {
    return new Response(JSON.stringify({ ok: true, env, dbCount: null }), { status: 200, headers: { 'content-type':'application/json' } });
  }

  try {
    // lazy require to avoid build pain locally
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(String(process.env.DATABASE_URL));
    const cnt = await sql`select count(*)::int as count from wishes` as any;
    const n = cnt?.[0]?.count ?? null;
    return new Response(JSON.stringify({ ok: true, env, dbCount: n }), { status: 200, headers: { 'content-type':'application/json' } });
  } catch (e: any) {
    try { console.error('[debug] db check failed', e?.message || e); } catch {}
    return new Response(JSON.stringify({ ok: false, env, dbCount: null, error: String(e?.message || e) }), { status: 500, headers: { 'content-type':'application/json' } });
  }
}

export default {};
