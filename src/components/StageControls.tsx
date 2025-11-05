'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useFullscreen } from '../hooks/useFullscreen';

export default function StageControls({ targetId }: { targetId: string }) {
  const [target, setTarget] = useState<HTMLElement|null>(null);
  const [visible, setVisible] = useState(true);
  const idle = useRef<any>(null);
  useEffect(() => setTarget(document.getElementById(targetId)), [targetId]);

  const { isFullscreen, toggle } = useFullscreen(target);

  useEffect(() => {
    if (!target) return;
    const show = () => { setVisible(true); clearTimeout(idle.current); idle.current = setTimeout(() => setVisible(false), 2000); };
    target.addEventListener('mousemove', show);
    target.addEventListener('touchstart', show, { passive: true } as any);
    show();
    return () => {
      target.removeEventListener('mousemove', show);
      target.removeEventListener('touchstart', show as any);
      clearTimeout(idle.current);
    };
  }, [target]);

  const supported = !!(target && ((target as any).requestFullscreen || (target as any).webkitRequestFullscreen || (target as any).webkitEnterFullscreen));

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="false">
      <div className={`pointer-events-auto absolute bottom-3 right-3 transition-opacity ${visible ? 'opacity-100' : 'opacity-0'}`}>
        <button
          type="button"
          onClick={toggle}
          aria-pressed={isFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen (Esc)' : 'Enter fullscreen (f)'}
          title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Enter fullscreen (f)'}
          disabled={!supported}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-neutral-900/70 text-neutral-100 shadow backdrop-blur-sm hover:bg-neutral-800/80 active:bg-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50"
        >
          {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
