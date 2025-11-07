import { deleteWish } from '../../../../src/lib/store';
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
  const idOrPrefix = (params?.id || '').trim();
  if (!idOrPrefix) return json({ ok: false, error: 'missing_id' }, 400);
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

  const res = await deleteWish(idOrPrefix);
  if (!res.ok) return json({ ok: false, error: 'not_found' }, 404);

  return json({ ok: true, deleted: res.deleted }, 200);
}

// Export default for CommonJS environments (optional)
export default {};
