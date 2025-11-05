import useSWR from 'swr';

export type WishItem = { id: string; name: string; message: string; createdAt: number };

const fetcher = async (url: string): Promise<WishItem[]> => {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load wishes');
  const data = await res.json().catch(() => ({} as any));
  const list = Array.isArray(data?.wishes) ? data.wishes : [];
  return list.map((w: any) => ({
    id: String(w.id),
    name: String(w.name || ''),
    message: String(w.message || ''),
    createdAt: typeof w.createdAt === 'number' ? w.createdAt : Date.parse(w.created_at || w.createdAt) || Date.now(),
  }));
};

export function useWishes() {
  const { data, error, isLoading, mutate } = useSWR<WishItem[]>(
    '/api/wishes',
    fetcher,
    { refreshInterval: 8000, revalidateOnFocus: true }
  );

  async function addWish(name: string, message: string) {
    const optimistic: WishItem = { id: `tmp-${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`, name: name || 'Anonymous', message, createdAt: Date.now() };
    await mutate(async current => {
      const base = Array.isArray(current) ? current : [];
      // optimistic push
      const optimisticList = [optimistic, ...base].sort((a,b)=>b.createdAt - a.createdAt);
      // fire POST
      try {
        const res = await fetch('/api/wish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, message })
        });
        if (!res.ok) throw new Error(await res.text());
        const body = await res.json().catch(() => ({} as any));
        const wish = body?.wish as WishItem | undefined;
        if (wish && wish.id) {
          // replace optimistic with real
          const filtered = optimisticList.filter(w => w.id !== optimistic.id);
          return [wish, ...filtered].sort((a,b)=>b.createdAt - a.createdAt);
        }
        return optimisticList;
      } catch {
        // rollback on error
        return base;
      }
    }, { revalidate: false });
    // Then revalidate from server
    mutate();
  }

  return {
    wishes: Array.isArray(data) ? data : [],
    loading: isLoading,
    error,
    addWish,
  };
}

export default useWishes;
