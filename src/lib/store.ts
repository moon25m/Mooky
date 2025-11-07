import 'server-only';
import { kv } from '@vercel/kv';

export type Wish = { id: string; name?: string; message: string; createdAt: number; pinned?: boolean };

const IS_PROD = process.env.NODE_ENV === 'production';

// ---- dev: file-backed list/delete (keep your existing dev delete if you have one)
async function devList(): Promise<Wish[]> {
  const mod = await import('../../server/data/wishes.json');
  return (mod.default as Wish[]).slice().sort((a,b)=>b.createdAt - a.createdAt);
}
async function devDelete(_idOrPrefix: string) { return true; }

// ---- prod: KV list/delete
async function kvList(): Promise<Wish[]> {
  const ids: string[] = await kv.zrange('wishes', 0, -1, { rev: true });
  if (!ids?.length) return [];
  const p = kv.pipeline();
  ids.forEach(id => p.hgetall<Wish>(`wish:${id}`));
  const rows = await p.exec() as Wish[];
  return rows.filter(Boolean);
}
async function kvDeleteById(id: string) { await kv.del(`wish:${id}`); await kv.zrem('wishes', id); return true; }

export async function listWishes() { return IS_PROD ? kvList() : devList(); }

export async function deleteWish(idOrPrefix: string): Promise<{ ok: boolean; deleted?: string }> {
  if (!IS_PROD) return { ok: await devDelete(idOrPrefix) };

  const ids: string[] = await kv.zrange('wishes', 0, -1);
  const full = ids.find(id => id === idOrPrefix || id.startsWith(idOrPrefix));
  if (!full) return { ok: false };
  await kvDeleteById(full);
  return { ok: true, deleted: full };
}
