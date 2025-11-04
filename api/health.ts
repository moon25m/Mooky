export const config = { runtime: 'edge' } as const;

export default async function handler(_req: Request) {
  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'content-type': 'application/json' },
  });
}
