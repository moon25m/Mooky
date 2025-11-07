// Fallback handler for /api/messages
// Accepts DELETE with id in query (?id=...) or JSON body { id: '...' }
export const runtime = 'edge';

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

// Consolidated fallback DELETE route for /api/messages
// This file provides a single implementation to avoid duplicate exports.
export const runtime = 'edge';

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

async function getIdFromReq(req: Request) {
  const url = new URL(req.url);
  let id = url.searchParams.get('id') || '';
  if (!id) {
    try {
      const ct = req.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const b = await req.json().catch(() => ({} as any));
        id = String(b?.id || b?._id || '');
      }
    } catch {}
  }
  return String(id || '').trim();
}

async function performDelete(id: string) {
  // If DATABASE_URL is available, use Neon/Postgres. Otherwise file-backed dev store is used.
  if (process.env.DATABASE_URL) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(String(process.env.DATABASE_URL));
    try { await sql`create table if not exists wishes (id text primary key, name text not null, message text not null, created_at timestamptz not null default now())`; } catch {}
    let rows = await sql`delete from wishes where id = ${id} returning id` as any;
    if ((!Array.isArray(rows) || rows.length === 0) && String(id).length === 8) {
      try { rows = await sql`delete from wishes where left(id,8) = ${id} returning id` as any; } catch (e) { console.error('[messages/fallback] prefix delete failed', e); }
    }
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const cnt = await sql`select count(*)::int as count from wishes` as any;
    return cnt?.[0]?.count ?? 0;
  }

  // file store fallback (dev)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fs = require('fs');
  const path = require('path');
  const dataFile = path.join(process.cwd(), 'server', 'data', 'wishes.json');
  if (!fs.existsSync(dataFile)) return null;
  const raw = fs.readFileSync(dataFile, 'utf8');
  const arr = JSON.parse(raw || '[]');
  let idx = arr.findIndex((x:any) => String(x.id) === String(id));
  if (idx === -1 && String(id).length === 8) idx = arr.findIndex((x:any) => String(x.id).slice(0,8).toLowerCase() === String(id).toLowerCase());
  if (idx === -1) return null;
  arr.splice(idx, 1);
  try { fs.writeFileSync(dataFile, JSON.stringify(arr, null, 2), 'utf8'); } catch (e) { console.error('[messages/fallback] persist failed', e); }
  return Array.isArray(arr) ? arr.filter(x=>x && typeof x.id === 'string').length : 0;
}

export async function DELETE(req: Request) {
  try {
    const id = await getIdFromReq(req);
    if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers: { 'content-type':'application/json' } });

    const headerPass = req.headers.get('x-admin-pass') || '';
    // production: require header-only auth
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
      if (!authorized) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'content-type':'application/json' } });
    }

    // Prevent file fallback in production
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      return new Response(JSON.stringify({ error: 'Server not configured' }), { status: 503, headers: { 'content-type':'application/json', 'Cache-Control':'no-store' } });
    }

    const remaining = await performDelete(id);
    if (remaining === null) {
      try { console.error('[messages/fallback] not found', { id }); } catch {}
      return new Response(JSON.stringify({ error: 'Not found', id }), { status: 404, headers: { 'content-type':'application/json', 'Cache-Control':'no-store' } });
    }
    return new Response(JSON.stringify({ ok: true, remaining }), { status: 200, headers: { 'content-type':'application/json', 'Cache-Control':'no-store' } });
  } catch (e:any) {
    console.error('[messages/fallback] handler failed', e?.message || e);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500, headers: { 'content-type':'application/json' } });
  }
}

export default {};
