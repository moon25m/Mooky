import useSWR from 'swr';

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json());

export function useWishCount() {
  const { data, error, isLoading, mutate } = useSWR<{ count: number }>(
    '/api/wishes/count',
    fetcher,
    { refreshInterval: 6000, revalidateOnFocus: true }
  );
  return { data, error, isLoading, mutate };
}
