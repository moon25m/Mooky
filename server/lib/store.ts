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

/* ---------- DEV: file-backed store (server only) ---------- */
async function devList(): Promise<Wish[]> {
  const fs = require('fs');
  const path = require('path');
  const dataFile = path.join(process.cwd(), 'server', 'data', 'wishes.json');
  if (!fs.existsSync(dataFile)) return [];
  const raw = fs.readFileSync(dataFile, 'utf8');
  const arr: Wish[] = JSON.parse(raw || '[]');
  return arr.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

async function devDelete(idOrPrefix: string): Promise<{ ok: boolean; deleted?: string }> {
  const fs = require('fs');
  const path = require('path');
  const dataFile = path.join(process.cwd(), 'server', 'data', 'wishes.json');
  if (!fs.existsSync(dataFile)) return { ok: false };

  const raw = fs.readFileSync(dataFile, 'utf8');
  const arr: any[] = JSON.parse(raw || '[]');

  let idx = arr.findIndex(x => String(x.id) === idOrPrefix);
  if (idx === -1) {
    const isPrefix = /^[a-f0-9]{6,32}$/i.test(idOrPrefix);
    if (isPrefix) idx = arr.findIndex(x => String(x.id).startsWith(idOrPrefix));
  }
  if (idx === -1) return { ok: false };

  const deletedId = arr[idx].id;
  arr.splice(idx, 1);
  fs.writeFileSync(dataFile, JSON.stringify(arr, null, 2), 'utf8');
  return { ok: true, deleted: deletedId };
}

/* ---------- PROD: Vercel KV store ---------- */
// Keys:
//  zset "wishes" -> ids scored by createdAt
//  hash "wish:{id}" -> wish object
async function kvList(): Promise<Wish[]> {
  const ids: string[] = await kv.zrange('wishes', 0, -1, { rev: true });
  if (!ids?.length) return [];
  const pipe = kv.pipeline();
  ids.forEach(id => pipe.hgetall<Wish>(`wish:${id}`));
  const rows = (await pipe.exec()) as Wish[];
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
    return devDelete(idOrPrefix);
  }
  const ids: string[] = await kv.zrange('wishes', 0, -1);
  const full = ids.find(id => id === idOrPrefix || id.startsWith(idOrPrefix));
  if (!full) return { ok: false };
  await kvDeleteById(full);
  return { ok: true, deleted: full };
}
