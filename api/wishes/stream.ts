import { getDb, listWishes, listWishesSince } from '../_lib/db';

export const runtime = 'edge';

export default async function handler(_req: Request) {
  const encoder = new TextEncoder();
  let lastTs: string | null = null;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // initial snapshot
      const rows = await listWishes(getDb());
      if (rows.length) lastTs = rows[0].created_at;
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type:'snapshot', wishes: rows })}\n\n`));

      // poll loop (edge-safe)
      const interval = 3000;
      const timer = setInterval(async () => {
        try {
          if (!lastTs) return; // nothing yet
          const news = await listWishesSince(lastTs!, getDb());
          if (news.length) {
            lastTs = news[news.length - 1].created_at;
            for (const w of news) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type:'wish', wish: w })}\n\n`));
            }
          } else {
            controller.enqueue(encoder.encode(`:keepalive\n\n`));
          }
        } catch {
          // swallow and keep polling
        }
      }, interval);
      // @ts-ignore - store to cancel on cancel
      (controller as any)._timer = timer;
    },
    cancel(reason) {
      // @ts-ignore
      const t = (this as any)?._timer as any;
      if (t) clearInterval(t);
    }
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache, no-transform',
      'connection': 'keep-alive'
    }
  });
}
