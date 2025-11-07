export const runtime = 'edge';

// Dev-only helper: run a simple SELECT to surface recent ids. Guarded to avoid exposure in production.
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return new Response(JSON.stringify({ error: 'Not available' }), { status: 404, headers: { 'content-type':'application/json' } });
  }
  if (!process.env.DATABASE_URL) {
    return new Response(JSON.stringify({ error: 'No DATABASE_URL' }), { status: 400, headers: { 'content-type':'application/json' } });
  }
  try {
    // lazy require neon
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(String(process.env.DATABASE_URL));
    // Query recent rows
    const rows = await sql`select id, left(id,8) as short, created_at from wishes order by created_at desc limit 10` as any;
    try { console.log('[dbcheck] recent wishes', rows); } catch {}
    return new Response(JSON.stringify({ ok: true, rows: rows || [] }), { status: 200, headers: { 'content-type':'application/json', 'Cache-Control':'no-store' } });
  } catch (e:any) {
    console.error('[dbcheck] failed', e?.message || e);
    return new Response(JSON.stringify({ error: 'Query failed' }), { status: 500, headers: { 'content-type':'application/json' } });
  }
}
