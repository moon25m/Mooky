import { getDb, insertWish, listWishes } from '../_lib/db';
import { containsBadWords } from '../_lib/profanity';

export const config = { runtime: 'edge' } as const;

export default async function handler(req: Request) {
  try {
    // Early guard: make misconfiguration obvious and return JSON instead of a Vercel HTML error
    if (!process.env.DATABASE_URL) {
      return json({ ok: false, error: 'Database is not configured on the server (missing DATABASE_URL). Please set it in Vercel → Project → Settings → Environment Variables.' }, { status: 503 });
    }
    if (req.method === 'GET') {
      const rows = await listWishes(getDb());
      return json({ wishes: rows });
    }
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      const name = String(body?.name || '').slice(0, 80).trim() || 'Anonymous';
      const message = String(body?.message || '').slice(0, 1000).trim();
      if (!message) return bad(400, 'Message required');
      if (containsBadWords(message)) return bad(400, 'Inappropriate language is not allowed.');
      const wish = await insertWish(name, message, getDb());
      // Note: for Edge, we won't email; client still sees immediate success
      return json({ ok: true, wish });
    }
    return bad(405, 'Method not allowed');
  } catch (e: any) {
    return bad(500, e?.message || 'Server error');
  }
}

function json(obj: any, init: ResponseInit = {}){
  return new Response(JSON.stringify(obj), { ...init, headers: { 'content-type': 'application/json', ...(init.headers||{}) } });
}
function bad(status: number, error: string){ return json({ ok:false, error }, { status }); }
