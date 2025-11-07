// Unified DELETE handler for messages (admin-only)
// Production: delete from Postgres (Neon) and require MOOKY_ADMIN_PASS + DATABASE_URL
// Dev: will fallback to file-backed server/data/wishes.json when DATABASE_URL is not set
export const runtime = 'edge';

// Note: this route is written to be safe in both Edge and Node runtimes. In production
// we require DATABASE_URL and MOOKY_ADMIN_PASS to be present; we DO NOT touch the
// file-backed store in production.

function parseCookies(cookieHeader?: string) {
  const out: Record<string,string> = {};
  if (!cookieHeader) return out;
  for (const part of cookieHeader.split(';')) {
    const [k,v] = part.split('=');
    if (!k) continue;
    out[k.trim()] = (v || '').trim();
  }
  return out;
}

export async function DELETE(req: Request, { params }:{ params: { id: string } }) {
  const id = params?.id || '';
  if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers: { 'content-type':'application/json' } });
  const headerPass = req.headers.get('x-admin-pass') || '';
  // In production require header-only auth; cookie-based admin is not accepted
  if (process.env.NODE_ENV === 'production') {
    const expected = process.env.MOOKY_ADMIN_PASS || '';
    if (!expected || headerPass !== expected) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type':'application/json', 'Cache-Control':'no-store' } });
    }
  } else {
    const cookies = parseCookies(req.headers.get('cookie') || '');
    const cookieFlag = cookies['mooky_admin'];
    const expected = process.env.MOOKY_ADMIN_PASS || process.env.NEXT_PUBLIC_MOOKY_ADMIN_PASS || process.env.REACT_APP_MOOKY_ADMIN_PASS || '';
    const authorized = (expected && headerPass === expected) || cookieFlag === '1';
    if (!authorized) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type':'application/json' } });
    }
  }

  // In production we require both DATABASE_URL and MOOKY_ADMIN_PASS to be set.
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.DATABASE_URL || !process.env.MOOKY_ADMIN_PASS) {
      return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 503, headers: { 'content-type':'application/json', 'Cache-Control':'no-store' } });
    }
  }

  // If DATABASE_URL is available, use Neon/Postgres. Create table if missing then delete.
  if (process.env.DATABASE_URL) {
    try {
      // lazy require to avoid hard dependency in other runtimes
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { neon } = require('@neondatabase/serverless');
      const sql = neon(String(process.env.DATABASE_URL));

      // Ensure table exists (id,name,message,created_at)
      try {
        await sql`create table if not exists wishes (
          id text primary key,
          name text not null,
          message text not null,
          created_at timestamptz not null default now()
        )`;
      } catch {}

      const rows = await sql`delete from wishes where id = ${id} returning id` as any;
      if (!Array.isArray(rows) || rows.length === 0) {
          // Log missing id for diagnostics
          try { console.error('[messages/delete] not found', { id }); } catch {}
          return new Response(JSON.stringify({ error: 'Not found', id }), { status: 404, headers: { 'content-type':'application/json', 'Cache-Control':'no-store' } });
      }
      // get remaining count
      try {
        const cnt = await sql`select count(*)::int as count from wishes` as any;
        const remaining = cnt?.[0]?.count ?? 0;
        return new Response(JSON.stringify({ success: true, remaining }), { status: 200, headers: { 'content-type':'application/json', 'Cache-Control':'no-store' } });
      } catch {
        return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'content-type':'application/json', 'Cache-Control':'no-store' } });
      }
    } catch (e: any) {
      console.error('[messages/delete] postgres delete failed', e?.message || e);
      return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'content-type':'application/json' } });
    }
  }

  // If we're in production, do not allow file-store fallback.
  if (process.env.NODE_ENV === 'production') {
    return new Response(JSON.stringify({ error: 'Not available' }), { status: 404, headers: { 'content-type':'application/json', 'Cache-Control':'no-store' } });
  }

  // Fallback: file-backed store used by the Express dev server (only in non-production)
  try {
    // use runtime fs operations
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    const path = require('path');
    const dataFile = path.join(process.cwd(), 'server', 'data', 'wishes.json');
    if (!fs.existsSync(dataFile)) {
      return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'content-type':'application/json', 'Cache-Control':'no-store' } });
    }
    const raw = fs.readFileSync(dataFile, 'utf8');
    const arr = JSON.parse(raw || '[]');
    const idx = arr.findIndex((x:any) => String(x.id) === String(id));
    if (idx === -1) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: { 'content-type':'application/json' } });
  arr.splice(idx, 1);
  fs.writeFileSync(dataFile, JSON.stringify(arr, null, 2), 'utf8');
  const remaining = Array.isArray(arr) ? arr.filter(x => x && typeof x.id === 'string').length : 0;
  return new Response(JSON.stringify({ success: true, remaining }), { status: 200, headers: { 'content-type':'application/json', 'Cache-Control':'no-store' } });
  } catch (e: any) {
    console.error('[messages/delete] file delete failed', e?.message || e);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'content-type':'application/json', 'Cache-Control':'no-store' } });
  }
}

// Export default for CommonJS environments (optional)
export default {};
