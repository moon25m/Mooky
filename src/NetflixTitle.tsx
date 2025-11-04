import React, { useEffect, useRef, useState } from 'react';
import './NetflixTitle.css';
import netflixSound from './netflix-sound.mp3';
import { useNavigate } from 'react-router-dom';
import { SPLASH_NAME, SPLASH_REDIRECT_PATH, SPLASH_DELAY_MS, SPLASH_FADE_MS, SPLASH_ENTER_APPEAR_MS, SPLASH_ANIMATE_MS } from './config/siteConfig';
import { pageTitle } from './lib/titles';
import MookyLogoNetflix from './components/MookyLogoNetflix';

const NetflixTitle: React.FC = () => {
  const [animate, setAnimate] = useState(false); // start zoom-out only on interaction
  const [fading, setFading] = useState(false);
  const [showEnter, setShowEnter] = useState(false);
  const navigate = useNavigate();
  const timeoutRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play the Netflix sound on click (optional engagement), but do not block auto-redirect
  const handleStart = () => {
    // Play preloaded audio (avoid constructing on click to reduce jank)
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {/* ignored */});
    }
    // cancel any auto timers so we control timing now
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setAnimate(true);
    // Let the zoom-out play fully, then fade and navigate
    window.setTimeout(() => {
      goNext();
    }, SPLASH_ANIMATE_MS);
  };

  // Preload audio and set splash title
  useEffect(() => {
    const previousTitle = document.title;
    // For the splash, show Home branding
    document.title = pageTitle('home');

    // Preload the sound to avoid decode jank during animation
    const el = new Audio(netflixSound);
    el.preload = 'auto';
    // Best-effort: kick off loading
    try { el.load(); } catch {}
    audioRef.current = el;
    return () => {
      document.title = previousTitle;
      // Release audio element
      if (audioRef.current) {
        try { audioRef.current.pause(); } catch {}
        audioRef.current = null;
      }
    };
  }, []);

  const goNext = () => {
    // start a short fade-out then navigate
    setFading(true);
    window.setTimeout(() => {
      navigate(SPLASH_REDIRECT_PATH);
    }, SPLASH_FADE_MS);
  };

  // Auto-redirect after configured delay, and reveal Enter button after delay
  useEffect(() => {
    // Start the zoom-out slightly before navigation so total time ~= SPLASH_DELAY_MS
    const autoAnimateStart = Math.max(0, SPLASH_DELAY_MS - (SPLASH_ANIMATE_MS + SPLASH_FADE_MS));

    const animateTimer = window.setTimeout(() => {
      setAnimate(true);
    }, autoAnimateStart);

    timeoutRef.current = window.setTimeout(() => {
      goNext();
    }, SPLASH_DELAY_MS);

    const showBtnTimer = window.setTimeout(() => {
      setShowEnter(true);
    }, SPLASH_ENTER_APPEAR_MS);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      clearTimeout(animateTimer);
      clearTimeout(showBtnTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`netflix-container ${fading ? 'fade-out' : ''}`}
  onClick={handleStart}
      role="banner"
      aria-label={`${SPLASH_NAME} splash`}
    >
      {/* Use SVG arc wordmark for pixel-perfect, performant rendering */}
      <MookyLogoNetflix className={`splash-name ${animate ? 'animate' : ''}`} />

      {/* Floating Enter button, appears after a short delay */}
      <button
        type="button"
        className={`splash-skip ${showEnter ? 'show' : 'hidden'}`}
        onClick={(e) => { e.stopPropagation(); handleStart(); }}
        aria-label="Enter"
      >
        Enter
      </button>
    </div>
  );
};

export default NetflixTitle;
