import { getDb } from '../_lib/db';

export const runtime = 'edge';

type InWish = { id?: string; name?: string; message?: string; createdAt?: number | string };

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const token = req.headers.get('x-seed-token') || '';
  const expected = process.env.SEED_TOKEN || '';
  if (!expected || token !== expected) return new Response('Unauthorized', { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const items: InWish[] = Array.isArray(body?.wishes) ? body.wishes : [];
    if (!items.length) return json({ ok: false, error: 'No wishes provided' }, { status: 400 });

    const sql = getDb();
    let inserted = 0;
    for (const w of items) {
      const id = String(w.id || crypto.randomUUID());
      const name = String(w.name || 'Anonymous');
      const message = String(w.message || '').slice(0, 1000);
      if (!message) continue;
      let createdAt: string;
      if (typeof w.createdAt === 'number') createdAt = new Date(w.createdAt).toISOString();
      else if (typeof w.createdAt === 'string') createdAt = new Date(w.createdAt).toISOString();
      else createdAt = new Date().toISOString();
      await sql`insert into wishes (id, name, message, created_at) values (${id}, ${name}, ${message}, ${createdAt}) on conflict (id) do nothing`;
      inserted++;
    }
    return json({ ok: true, inserted });
  } catch (e: any) {
    return json({ ok: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}

function json(obj: any, init: ResponseInit = {}) {
  return new Response(JSON.stringify(obj), { ...init, headers: { 'content-type': 'application/json', ...(init.headers || {}) } });
}
