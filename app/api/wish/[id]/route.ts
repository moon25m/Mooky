export const runtime = 'edge';
import { deleteWish } from '../../../../server/lib/store';

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const idOrPrefix = (params?.id || '').trim();
  if (!idOrPrefix) return json({ ok: false, error: 'missing_id' }, 400);

  // Header-only admin in prod
  const headerPass = req.headers.get('x-admin-pass') || '';
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.MOOKY_ADMIN_PASS) return json({ ok: false, error: 'server_misconfig' }, 500);
    if (headerPass !== process.env.MOOKY_ADMIN_PASS) return json({ ok: false, error: 'unauthorized' }, 401);
  }

  const res = await deleteWish(idOrPrefix);
  if (!res.ok) return json({ ok: false, error: 'not_found' }, 404);
  return json({ ok: true, deleted: res.deleted }, 200);
}
