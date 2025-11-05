import { useEffect, useRef, useState } from 'react';
import { pusherClient, CHANNEL, EVENTS, PRESENCE } from '../lib/pusher-client';
import { mutate as globalMutate } from 'swr';

export type WishRow = { id: string; name: string; message: string; created_at: string };

export function useRealtimeWishes(onNewWish?: (w: WishRow) => void) {
  const [typing, setTyping] = useState<string | null>(null);
  const [presence, setPresence] = useState<number>(0);
  const timer = useRef<any>(null);

  useEffect(() => {
  if (!pusherClient) return;
    const ch = pusherClient.subscribe(CHANNEL);

    ch.bind(EVENTS.NEW, (row: WishRow) => {
      try { onNewWish?.(row); } catch {}
      // Revalidate SWR keys if present
      try { globalMutate('/api/wish'); } catch {}
      try { globalMutate('/api/wish/count'); } catch {}
    });

    ch.bind(EVENTS.TYPING_START, (p: { name: string }) => {
      setTyping(`${p?.name || 'Someone'} is typing…`);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setTyping(null), 3500);
    });

    ch.bind(EVENTS.TYPING_STOP, () => {
      setTyping(null);
    });

    // Presence channel for live viewers
    let pres: any = null;
    try {
      pres = pusherClient.subscribe(PRESENCE) as any;
      pres.bind('pusher:subscription_succeeded', (members: any) => setPresence(members?.count || 1));
      pres.bind('pusher:member_added', () => setPresence(c => Math.max(1, c + 1)));
      pres.bind('pusher:member_removed', () => setPresence(c => Math.max(0, c - 1)));
    } catch {}

    return () => {
      try { pusherClient?.unsubscribe?.(CHANNEL); } catch {}
      try { pres && pusherClient?.unsubscribe?.(PRESENCE); } catch {}
      clearTimeout(timer.current);
    };
  }, [onNewWish]);

  return { typing, presence };
}
