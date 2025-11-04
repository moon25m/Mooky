import { getDb } from './_lib/db';

export const config = { runtime: 'edge' } as const;

export default async function handler(_req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return json({ ok: false, error: 'DATABASE_URL missing' }, { status: 503 });
    }
    const sql = getDb();
    const r = await sql`select 1 as ok` as any;
    return json({ ok: r?.[0]?.ok === 1 });
  } catch (e: any) {
    return json({ ok: false, error: e?.message || 'failed' }, { status: 500 });
  }
}

function json(obj: any, init: ResponseInit = {}) {
  return new Response(JSON.stringify(obj), { ...init, headers: { 'content-type': 'application/json', ...(init.headers || {}) } });
}
