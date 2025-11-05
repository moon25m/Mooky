import { useEffect, useState, useCallback } from 'react';

export function useFullscreen(target: HTMLElement | null) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const getFS = () => (document as any).fullscreenElement || (document as any).webkitFullscreenElement;

  const enter = useCallback(async () => {
    if (!target) return;
    try {
      const req = (target as any).requestFullscreen || (target as any).webkitRequestFullscreen || (target as any).webkitEnterFullscreen;
      if (typeof req === 'function') await req.call(target);
    } catch (e) { console.error('enter fullscreen failed', e); }
  }, [target]);

  const exit = useCallback(async () => {
    try {
      const exitFn = (document as any).exitFullscreen || (document as any).webkitExitFullscreen || (document as any).webkitCancelFullScreen;
      if (typeof exitFn === 'function') await exitFn.call(document);
    } catch (e) { console.error('exit fullscreen failed', e); }
  }, []);

  const toggle = useCallback(() => (getFS() ? exit() : enter()), [enter, exit]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(getFS()));
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange as any);
    const onKey = (e: KeyboardEvent) => {
      const key = e.key?.toLowerCase?.() || '';
      if (key === 'f') toggle();
      if (e.key === 'Escape') exit();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange as any);
      document.removeEventListener('keydown', onKey);
    };
  }, [toggle, exit]);

  // Prevent background scroll while in fullscreen for better UX on mobile
  useEffect(() => {
    const root = document.documentElement as HTMLElement;
    if (isFullscreen) {
      const prev = root.style.overflow;
      root.style.overflow = 'hidden';
      return () => { root.style.overflow = prev; };
    }
  }, [isFullscreen]);

  return { isFullscreen, enter, exit, toggle };
}
