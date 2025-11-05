import { useEffect, useRef, useState } from 'react';
import { pusherClient, CHANNEL, EVENTS } from '../lib/pusher-client';
import { mutate as globalMutate } from 'swr';

export type WishRow = { id: string; name: string; message: string; created_at: string };

export function useRealtimeWishes(onNewWish?: (w: WishRow) => void) {
  const [typing, setTyping] = useState<string | null>(null);
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

    return () => {
      try { pusherClient?.unsubscribe?.(CHANNEL); } catch {}
      clearTimeout(timer.current);
    };
  }, [onNewWish]);

  return { typing };
}
