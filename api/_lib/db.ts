import { neon } from '@neondatabase/serverless';

// Edge-friendly Postgres client using Neon (DATABASE_URL required)
export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

export type Wish = { id: string; name: string; message: string; created_at: string };

let ensured = false;
async function ensureSchema(sql = getDb()) {
  if (ensured) return;
  // Create table if it doesn't exist (id, name, message, created_at default now())
  await sql`create table if not exists wishes (
    id text primary key,
    name text not null,
    message text not null,
    created_at timestamptz not null default now()
  )`;
  ensured = true;
}

export async function listWishes(sql = getDb()): Promise<Wish[]> {
  await ensureSchema(sql);
  const rows = await sql<Wish>`select id, name, message, created_at from wishes order by created_at desc`;
  return rows;
}

export async function listWishesSince(ts: string, sql = getDb()): Promise<Wish[]> {
  await ensureSchema(sql);
  const rows = await sql<Wish>`select id, name, message, created_at from wishes where created_at > ${ts} order by created_at asc`;
  return rows;
}

export async function insertWish(name: string, message: string, sql = getDb()): Promise<Wish> {
  await ensureSchema(sql);
  const id = crypto.randomUUID();
  const rows = await sql<Wish>`insert into wishes (id, name, message) values (${id}, ${name}, ${message}) returning id, name, message, created_at`;
  return rows[0];
}
