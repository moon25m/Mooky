import useSWR from 'swr';

export type WishItem = { id: string; name: string; message: string; createdAt?: number; created_at?: string };

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json());

export function useWishes() {
  const { data, error, isLoading, mutate } = useSWR<{ wishes: WishItem[] }>(
    '/api/wish',
    fetcher,
    { refreshInterval: 8000, revalidateOnFocus: true }
  );
  return { data, error, isLoading, mutate };
}
