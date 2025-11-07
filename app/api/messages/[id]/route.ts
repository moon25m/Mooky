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

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
    },
  });
}

export async function DELETE(req: Request, { params }:{ params: { id: string } }) {
  const input = (params?.id || '').trim();
  if (!input) return json({ ok: false, error: 'missing_id' }, 400);
  const headerPass = req.headers.get('x-admin-pass') || '';
  // In production require header-only auth; cookie-based admin is not accepted
  if (process.env.NODE_ENV === 'production') {
    const expected = process.env.MOOKY_ADMIN_PASS || '';
    if (!expected || headerPass !== expected) {
      return json({ ok: false, error: 'unauthorized' }, 401);
    }
  } else {
    const cookies = parseCookies(req.headers.get('cookie') || '');
    const cookieFlag = cookies['mooky_admin'];
    const expected = process.env.MOOKY_ADMIN_PASS || process.env.NEXT_PUBLIC_MOOKY_ADMIN_PASS || process.env.REACT_APP_MOOKY_ADMIN_PASS || '';
    const authorized = (expected && headerPass === expected) || cookieFlag === '1';
    if (!authorized) {
      return json({ ok: false, error: 'unauthorized' }, 401);
    }
  }

  // In production we require both DATABASE_URL and MOOKY_ADMIN_PASS to be set.
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.DATABASE_URL || !process.env.MOOKY_ADMIN_PASS) {
      return json({ ok: false, error: 'server_not_configured' }, 503);
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

      // List all wishes (for prefix match)
      let allRows: any[] = [];
      try {
        allRows = await sql`select id from wishes` as any;
      } catch {}

      // Prefer exact match
      let targetId = allRows.find(w => w.id === input)?.id || null;
      // If not found, allow 8-hex prefix match (lenient: 6–32 hex)
      if (!targetId) {
        const isPrefix = /^[a-f0-9]{6,32}$/i.test(input);
        if (isPrefix) {
          targetId = allRows.find(w => w.id.startsWith(input))?.id || null;
        }
      }
      if (!targetId) return json({ ok: false, error: 'not_found' }, 404);

      // Delete by targetId
      let rows = await sql`delete from wishes where id = ${targetId} returning id` as any;
      if (!Array.isArray(rows) || rows.length === 0) {
        return json({ ok: false, error: 'not_found' }, 404);
      }
      return json({ ok: true, deleted: targetId }, 200);
    } catch (e: any) {
      return json({ ok: false, error: String(e?.message || e) }, 500);
    }
  }

  // If we're in production, do not allow file-store fallback.
  if (process.env.NODE_ENV === 'production') {
    return json({ ok: false, error: 'not_available' }, 404);
  }

  // Fallback: file-backed store used by the Express dev server (only in non-production)
  try {
    // use runtime fs operations
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    const path = require('path');
    const dataFile = path.join(process.cwd(), 'server', 'data', 'wishes.json');
    if (!fs.existsSync(dataFile)) {
      return json({ ok: false, error: 'not_found' }, 404);
    }
    const raw = fs.readFileSync(dataFile, 'utf8');
    const arr = JSON.parse(raw || '[]');
    // Prefer exact match, then prefix
    let idx = arr.findIndex((x:any) => String(x.id) === input);
    if (idx === -1) {
      const isPrefix = /^[a-f0-9]{6,32}$/i.test(input);
      if (isPrefix) {
        idx = arr.findIndex((x:any) => String(x.id).startsWith(input));
      }
    }
    if (idx === -1) return json({ ok: false, error: 'not_found' }, 404);
    const deletedId = arr[idx].id;
    arr.splice(idx, 1);
    fs.writeFileSync(dataFile, JSON.stringify(arr, null, 2), 'utf8');
    return json({ ok: true, deleted: deletedId }, 200);
    return new Response(JSON.stringify({ ok: true, remaining }), { status: 200, headers: { 'content-type':'application/json', 'Cache-Control':'no-store' } });
  } catch (e: any) {
    console.error('[messages/delete] file delete failed', e?.message || e);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'content-type':'application/json', 'Cache-Control':'no-store' } });
  }
}

// Export default for CommonJS environments (optional)
export default {};
