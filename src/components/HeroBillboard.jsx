import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MaturityBadge from './MaturityBadge';
import BirthdayCountdown from './BirthdayCountdown.jsx';
import { bumpTvAgeIfNov5 } from '../utils/dateTZ';

/**
 * @param {{
 *  title: string,
 *  logline: string,
 *  maturity: string,
 *  backdropSrc?: string,
 *  onPlay?: () => void,
 *  onMore?: () => void,
 * }} props
 */
export default function HeroBillboard({
  title,
  logline,
  maturity,
  backdropSrc,
  onPlay,
  onMore,
}) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [videoOk, setVideoOk] = useState(true);
  const displayRating = useMemo(() => bumpTvAgeIfNov5(maturity || ''), [maturity]);

  const tryVideo = (backdropSrc || '').toLowerCase().endsWith('.mp4') && videoOk;

  const handlePlay = () => (onPlay ? onPlay() : navigate('/birthday'));
  const handleMore = () => (onMore ? onMore() : setShowModal(true));

  return (
    <header className="hero">
      <div className="hero-media" aria-hidden>
        {tryVideo ? (
          <video
            className="hero-bg"
            autoPlay
            muted
            loop
            playsInline
            poster="/assets/bg/orbit-hero.jpg"
            onError={() => setVideoOk(false)}
          >
            <source src={backdropSrc} type="video/mp4" />
          </video>
        ) : (
          <img className="hero-bg" src={'/assets/bg/orbit-hero.jpg'} alt="" />
        )}
        <div className="hero-gradient" />
        <div className="hero-grain" />
      </div>

      <div className="hero-inner">
        <div className="hero-left">
          <h1 className="hero-title">{title}</h1>
          <div className="hero-label">Premieres in Dhaka Time — November 5</div>
          <div className="hero-countdown">
            <BirthdayCountdown label={''} />
          </div>
          <p className="hero-logline">
            {logline}
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={handlePlay}>Play</button>
            <button className="btn btn-secondary" onClick={handleMore}>More Info</button>
          </div>
        </div>
        <div className="hero-right">
          <MaturityBadge rating={displayRating} />
        </div>
      </div>

      {showModal && (
        <div className="hero-modal" role="dialog" aria-modal="true" aria-label="More Info">
          <div className="hero-modal-content">
            <button className="hero-modal-close" onClick={() => setShowModal(false)} aria-label="Close">×</button>
            <h3>{title}</h3>
            <p>
              Romance • Poetic • One-Sided
            </p>
            <p>
              In the silent gravity of unspoken love, one soul keeps circling the same name. Each November 5, the world resets — the same sky, the same memory, the same unanswered heartbeat.
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
