import { neon } from '@neondatabase/serverless';

// Edge-friendly Postgres client using Neon (DATABASE_URL required)
function sanitizeDbUrl(raw?: string) {
  if (!raw) return '';
  let s = raw.trim();
  // Strip accidental 'psql ' prefix and surrounding quotes copied from Neon UI
  s = s.replace(/^psql\s+/, '');
  s = s.replace(/^['"]|['"]$/g, '');
  return s;
}

export function getDb() {
  const raw = process.env.DATABASE_URL;
  const url = sanitizeDbUrl(raw);
  if (!url) throw new Error('DATABASE_URL is not set');
  if (!/^postgres(ql)?:\/\//i.test(url)) {
    throw new Error('DATABASE_URL is not a valid postgres URL');
  }
  // Helpful warning if user accidentally uses pooler host intended for TCP drivers
  try {
    const host = new URL(url).host;
    if (/pooler\./.test(host)) {
      console.warn('[wishes] Using pooler host in DATABASE_URL. For @neondatabase/serverless, non-pooler host also works.');
    }
  } catch {}
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
  const rows = await sql`select id, name, message, created_at from wishes order by created_at desc` as any;
  return rows as Wish[];
}

export async function listWishesSince(ts: string, sql = getDb()): Promise<Wish[]> {
  await ensureSchema(sql);
  const rows = await sql`select id, name, message, created_at from wishes where created_at > ${ts} order by created_at asc` as any;
  return rows as Wish[];
}

export async function insertWish(name: string, message: string, sql = getDb()): Promise<Wish> {
  await ensureSchema(sql);
  const id = crypto.randomUUID();
  const rows = await sql`insert into wishes (id, name, message) values (${id}, ${name}, ${message}) returning id, name, message, created_at` as any;
  return (rows as Wish[])[0];
}
