export const runtime = 'edge';

export async function GET() {
  try {
    // Prefer Postgres if configured
    if (process.env.DATABASE_URL) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { neon } = require('@neondatabase/serverless');
      const sql = neon(String(process.env.DATABASE_URL));
      try {
        const rows = await sql`select count(*)::int as count from wishes` as any;
        const n = rows?.[0]?.count ?? 0;
        return new Response(JSON.stringify({ count: n }), { status: 200, headers: { 'content-type':'application/json', 'Cache-Control':'no-store' } });
      } catch (e) {
        return new Response(JSON.stringify({ count: 0 }), { status: 200, headers: { 'content-type':'application/json', 'Cache-Control':'no-store' } });
      }
    }

    // Dev fallback: read file store
    if (process.env.NODE_ENV === 'production') {
      return new Response(JSON.stringify({ error: 'Not available' }), { status: 404, headers: { 'content-type':'application/json', 'Cache-Control':'no-store' } });
    }
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    const path = require('path');
    const dataFile = path.join(process.cwd(), 'server', 'data', 'wishes.json');
    if (!fs.existsSync(dataFile)) return new Response(JSON.stringify({ count: 0 }), { status: 200, headers: { 'content-type':'application/json' } });
    const raw = fs.readFileSync(dataFile, 'utf8');
    const arr = JSON.parse(raw || '[]');
    const n = Array.isArray(arr) ? arr.filter(x => x && typeof x.id === 'string').length : 0;
    return new Response(JSON.stringify({ count: n }), { status: 200, headers: { 'content-type':'application/json', 'Cache-Control':'no-store' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ count: 0 }), { status: 500, headers: { 'content-type':'application/json', 'Cache-Control':'no-store' } });
  }
}
