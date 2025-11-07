import 'server-only';
import { kv } from '@vercel/kv';

export type Wish = {
  id: string;
  name?: string;
  message: string;
  createdAt: number;
  pinned?: boolean;
};

const IS_PROD = process.env.NODE_ENV === 'production';

// ---- Local file store (dev only) ----
async function devList(): Promise<Wish[]> {
  // replace with your current dev loader:
  const mod = await import('../../server/data/wishes.json');
  // Ensure newest first
  return (mod.default as Wish[]).slice().sort((a, b) => b.createdAt - a.createdAt);
}

async function devDelete(id: string) {
  // If your dev delete already works, just call it instead.
  // Here we no-op because dev works for you. Keep your existing dev delete implementation.
  return true;
}

// ---- KV store (prod) ----
// Keys:
//  - zset "wishes" holds ids sorted by createdAt
//  - hash "wish:{id}" holds the wish object
async function kvList(): Promise<Wish[]> {
  const ids: string[] = await kv.zrange('wishes', 0, -1, { rev: true }); // newest first
  if (!ids?.length) return [];
  const pipeline = kv.pipeline();
  ids.forEach(id => pipeline.hgetall<Wish>(`wish:${id}`));
  const rows = (await pipeline.exec()) as Wish[];
  return rows.filter(Boolean);
}

async function kvDeleteById(id: string) {
  await kv.del(`wish:${id}`);
  await kv.zrem('wishes', id);
  return true;
}

export async function listWishes(): Promise<Wish[]> {
  return IS_PROD ? kvList() : devList();
}

export async function deleteWish(idOrPrefix: string): Promise<{ ok: boolean; deleted?: string }> {
  if (!IS_PROD) {
    // dev path: delegate to your existing delete that already works
    // If you want prefix matching locally too, implement it similar to prod below.
    return { ok: await devDelete(idOrPrefix) };
  }

  // prod: resolve prefix -> full id
  const ids: string[] = await kv.zrange('wishes', 0, -1);
  const full = ids.find(id => id === idOrPrefix || id.startsWith(idOrPrefix));
  if (!full) return { ok: false };

  await kvDeleteById(full);
  return { ok: true, deleted: full };
}
