import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import StageControls from '../components/StageControls';
import HeaderOpenButton from '../components/HeaderOpenButton';

const BASE_SURPRISE_URL = process.env.REACT_APP_SURPRISE_URL || 'https://hbd-card.netlify.app/';

export default function Surprise(){
  const [opened, setOpened] = useState(false);
  const [embedReady, setEmbedReady] = useState(false);
  const [embedFailed, setEmbedFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Try to hint the external project to start directly (adds autoplay=1 and #start if missing)
  const SURPRISE_URL = (() => {
    try {
      const u = new URL(BASE_SURPRISE_URL);
      if (!u.searchParams.has('autoplay')) u.searchParams.set('autoplay', '1');
      if (!u.hash) u.hash = '#start';
      return u.toString();
    } catch {
      // Fallback string manipulation
      const sep = BASE_SURPRISE_URL.includes('?') ? '&' : '?';
      const withAuto = BASE_SURPRISE_URL.includes('autoplay=') ? BASE_SURPRISE_URL : `${BASE_SURPRISE_URL}${sep}autoplay=1`;
      return withAuto.includes('#') ? withAuto : `${withAuto}#start`;
    }
  })();

  const burst = () => {
    const opts = { particleCount: 120, spread: 70, startVelocity: 30, origin: { y: 0.4 } } as const;
    confetti({ ...opts, angle: 60, origin: { x: 0 } });
    confetti({ ...opts, angle: 120, origin: { x: 1 } });
    confetti({ ...opts, particleCount: 80, scalar: 0.9 });
  };

  // Play a celebratory burst when opening the local card
  useEffect(()=>{
    if (!opened) return;
    burst();
    const t = setTimeout(()=> burst(), 900);
    return ()=> clearTimeout(t);
  },[opened]);

  // Attempt to load external card demo inside an iframe
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!embedReady) setEmbedFailed(true); // likely blocked by X-Frame-Options
    }, 3500);
    return () => {
      clearTimeout(timer);
    };
  }, [embedReady]);

  // Fullscreen is controlled by SurpriseControls now; we keep isFs only to flip CSS class.

  return (
    <main className="mx-auto max-w-[960px] p-5 text-white">
      {/* Header */}
      <section className="mb-4 rounded-2xl border border-neutral-800 bg-neutral-950 px-5 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="m-0 text-3xl font-semibold">For You 🎉</h1>
            <p className="m-0 mt-1 opacity-80">Enjoy a birthday card. If the live preview is blocked, a built‑in card appears below.</p>
          </div>
          <HeaderOpenButton href={SURPRISE_URL} />
        </div>
      </section>

      {/* Media Stage */}
      <section className="mb-4 rounded-xl border border-neutral-800 bg-neutral-900 p-2">
        <div className="relative">
          <div id="surprise-stage" ref={stageRef} className="relative w-full overflow-hidden rounded-xl bg-black aspect-[16/9] relax-aspect landscape-tight">
            <iframe
              ref={iframeRef}
              title="Happy Birthday Card"
              src={SURPRISE_URL}
              onLoad={() => { setEmbedReady(true); setLoading(false); }}
              allowFullScreen
              sandbox="allow-scripts allow-same-origin"
              className="h-full w-full border-0"
            />
            {loading && (
              <div className="absolute inset-0 grid place-items-center rounded-xl bg-neutral-950 text-neutral-400 font-semibold">Loading…</div>
            )}
            <StageControls targetId="surprise-stage" />
          </div>
        </div>
        {embedFailed && (
          <div className="mt-2 opacity-85">Embed blocked by the site. Use the button above to open it in a new tab.</div>
        )}
      </section>

      {/* Local fallback interactive card */}
      <section className="grid min-h-[60vh] place-items-center" aria-live="polite">
        {!opened && (
          <button className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-500 active:bg-red-700" onClick={()=>setOpened(true)}>Open Surprise</button>
        )}
        <div className="relative h-[220px] w-[320px] [perspective:1000px]">
          <div className={`relative h-full w-full transition-transform duration-[900ms] [transform-style:preserve-3d] [transition-timing-function:cubic-bezier(.2,.8,.2,1)] ${opened ? '[transform:rotateY(180deg)]' : ''}`}>
            {/* Front */}
            <div className="absolute inset-0 rounded-[14px] border border-neutral-800 bg-gradient-to-b from-neutral-800 to-neutral-900 [backface-visibility:hidden]">
              <div className="absolute left-3 top-3 rounded-full bg-red-600 px-3 py-1 font-bold">Happy Birthday</div>
              <div className="absolute bottom-3 right-4 text-2xl opacity-90">❤</div>
            </div>
            {/* Inside */}
            <div className="absolute inset-0 grid gap-2 rounded-[14px] border border-neutral-800 bg-neutral-900 p-4 [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <h2 className="m-0 text-xl font-semibold">Dear Mooky,</h2>
              <p className="m-0">Wishing you a day as wonderful as you are. May your year be filled with laughter, discovery, and delightful surprises. ✨</p>
              <p className="m-0 opacity-90">— From Drakon & friends</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
