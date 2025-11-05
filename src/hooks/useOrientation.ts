import { useEffect, useState } from 'react';

export function useOrientation() {
  const get = () => (window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape');
  const [o, setO] = useState<'portrait' | 'landscape'>(typeof window === 'undefined' ? 'portrait' : get());
  useEffect(() => {
    const mqp = window.matchMedia('(orientation: portrait)');
    const on = () => setO(mqp.matches ? 'portrait' : 'landscape');
    mqp.addEventListener?.('change', on as any);
    window.addEventListener('orientationchange', on as any);
    on();
    return () => {
      mqp.removeEventListener?.('change', on as any);
      window.removeEventListener('orientationchange', on as any);
    };
  }, []);
  return o;
}
