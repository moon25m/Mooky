'use client';
import React, { useEffect, useState } from 'react';
import { Maximize2, Minimize2, ExternalLink } from 'lucide-react';
import { useFullscreen } from '../hooks/useFullscreen';

export default function SurpriseControls({ targetId, openHref }:{ targetId:string; openHref:string }) {
  const [target, setTarget] = useState<HTMLElement|null>(null);
  useEffect(() => setTarget(document.getElementById(targetId)), [targetId]);
  const { isFullscreen, toggle } = useFullscreen(target);

  const fullscreenSupported = !!(target && ((target as any).requestFullscreen || (target as any).webkitRequestFullscreen || (target as any).webkitEnterFullscreen));

  return (
    <div className="flex items-center gap-2">
      <a
        href={openHref}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium bg-red-600 hover:bg-red-500 active:bg-red-700 text-white shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        title="Open in new tab"
      >
        <ExternalLink className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Open in new tab</span>
      </a>

      <button
        type="button"
        onClick={toggle}
        aria-pressed={isFullscreen}
        aria-label={isFullscreen ? 'Exit fullscreen (Esc)' : 'Enter fullscreen (f)'}
        title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Enter fullscreen (f)'}
        disabled={!fullscreenSupported}
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-900 text-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:opacity-50"
      >
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        <span className="hidden sm:inline">Fullscreen</span>
      </button>
    </div>
  );
}
