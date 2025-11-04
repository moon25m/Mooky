import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import '../styles/surprise.css';

const BASE_SURPRISE_URL = process.env.REACT_APP_SURPRISE_URL || 'https://hbd-card.netlify.app/';

export default function Surprise(){
  const [opened, setOpened] = useState(false);
  const [embedReady, setEmbedReady] = useState(false);
  const [embedFailed, setEmbedFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFs, setIsFs] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const embedWrapRef = useRef<HTMLDivElement | null>(null);

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
    const onFs = () => setIsFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    const timer = setTimeout(() => {
      if (!embedReady) setEmbedFailed(true); // likely blocked by X-Frame-Options
    }, 3500);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('fullscreenchange', onFs);
    };
  }, [embedReady]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await embedWrapRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // ignore
    }
  };

  return (
    <main className="surprise-shell">
      <section className="surprise-hero">
        <h1>For You 🎉</h1>
        <p>Enjoy a birthday card. If the live preview is blocked, a built‑in card appears below.</p>
      </section>

      {/* Try to embed the external project output */}
  <section className={`surprise-embed ${isFs ? 'is-fs' : ''}`} ref={embedWrapRef}>
        <div className="toolbar">
          <a className="btn-primary" href={SURPRISE_URL} target="_blank" rel="noopener noreferrer">Open in new tab</a>
          <button type="button" className="btn-secondary" onClick={toggleFullscreen}>{isFs ? 'Exit Fullscreen' : 'Fullscreen'}</button>
        </div>
        <div className={`embed-frame ${loading ? 'loading' : ''}`}>
          <iframe
          ref={iframeRef}
          title="Happy Birthday Card"
          src={SURPRISE_URL}
          onLoad={() => { setEmbedReady(true); setLoading(false); }}
          allowFullScreen
          sandbox="allow-scripts allow-same-origin"
        />
          {loading && <div className="embed-loading">Loading…</div>}
        </div>
        {embedFailed && (
          <div className="blocked-note">Embed blocked by the site. Use the button above to open it in a new tab.</div>
        )}
      </section>

      {/* Local fallback interactive card */}
      <section className={`card-wrap ${opened ? 'open' : ''}`} aria-live="polite">
        {!opened && (
          <button className="btn-primary" onClick={()=>setOpened(true)}>Open Surprise</button>
        )}
        <div className="card">
          <div className="front">
            <div className="ribbon">Happy Birthday</div>
            <div className="heart">❤</div>
          </div>
          <div className="inside">
            <h2>Dear Mooky,</h2>
            <p>Wishing you a day as wonderful as you are. May your year be filled with laughter, discovery, and delightful surprises. ✨</p>
            <p className="sig">— From Drakon & friends</p>
          </div>
        </div>
      </section>
    </main>
  );
}
