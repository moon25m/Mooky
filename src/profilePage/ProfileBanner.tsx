import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileBanner.css';
import CTAButton from '../components/CTAButton';
import QuietNoteModal from '../components/QuietNoteModal';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import { getProfileBanner } from '../queries/getProfileBanner';
import { ProfileBanner as ProfileBannerType } from '../types';
import BirthdayCountdown from '../components/BirthdayCountdown.jsx';
import confetti from 'canvas-confetti';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

type BannerProps = { backgroundImage?: string };

const ProfileBanner: React.FC<BannerProps> = ({ backgroundImage }) => {
  const navigate = useNavigate();


  const [bannerData, setBannerData] = useState<ProfileBannerType | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [maturityLabel, setMaturityLabel] = useState<string>('TV-22');
  const location = useLocation();
  const isGalaxy = location.pathname && location.pathname.includes('/profile/galaxy');
  const [qnOpen, setQnOpen] = useState(false);

  // configure dayjs tz locally for this module
  dayjs.extend(utc);
  dayjs.extend(timezone);
  const DHK_TZ = 'Asia/Dhaka';
  const BDayCountdown = BirthdayCountdown as unknown as React.ComponentType<any>;

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getProfileBanner();
        setBannerData(data);
      } catch (e) {
        // Fallback to avoid console errors if CMS is unavailable or schema differs
        const fallback: ProfileBannerType = {
          backgroundImage: { url: '' },
          headline: 'MOOKY – Orbit (2025)',
          resumeLink: { url: '#' },
          linkedinLink: '#',
          profileSummary: ''
        } as unknown as ProfileBannerType;
        setBannerData(fallback);
      }
    }
    fetchData();
  }, []);

  // Dynamic maturity badge based on Dhaka time and increases every Nov 5 annually
  useEffect(() => {
    const update = () => {
      const now = dayjs().tz(DHK_TZ);
      const year = now.year();
      const cutoff = dayjs.tz(`${year}-11-05T00:00:00`, DHK_TZ);
      const baseYear = 2025;
      const basePre = 22; // before 2025-11-05
      const basePost = 23; // on/after 2025-11-05
      const base = now.isBefore(cutoff) ? basePre : basePost;
      const value = base + (year - baseYear);
      setMaturityLabel(`TV-${value}`);
    };
    update();
    const id = window.setInterval(update, 60 * 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!bannerData) return <div>Loading...</div>;

  const handlePlayClick = () => {
    navigate('/wish');
  };

  const handleLinkedinClick = () => { 
    window.open(bannerData.linkedinLink, '_blank');
  }


  const handleCountdownReached = () => {
    try {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    } catch (_) {
      // ignore confetti errors
    }
    setIsStreaming(true);
  };

  return (
    <div className="profile-banner billboard-enter hero-container">
      <Hero backgroundImage={backgroundImage}>
  <div className="banner-content">
        {/* Brand row like Netflix (N SERIES) */}
        <div className="nf-brand" aria-label="Brand">
          <span className="nf-n">M</span>
          <span className="nf-series">SERIES</span>
        </div>

        <h1 className="hero-title" id='headline'>
          ORBIT (2025)
          <br />
          <span className="subtitle">A Story That Never Reached Its Star</span>
        </h1>

        {/* Topline row like Netflix (TOP 10 #1 Today) */}
        <div className="nf-topline">
          <span className="nf-top10-badge" aria-hidden="true">
            <span className="t">TOP</span>
            <span className="n">10</span>
          </span>
          <span className="nf-top10-text"><strong>#1</strong> in TV Shows Today</span>
        </div>

        {/* Optional chips row for metadata */}
        <div className="nf-chips" role="list">
          <span className="chip" role="listitem">New</span>
          <span className="chip" role="listitem">2025</span>
          <span className="chip" role="listitem">Feature</span>
        </div>

        <div className="birthday-countdown-wrapper">
          <BDayCountdown
            label="Premieres in Dhaka Time — November 5"
            onReached={handleCountdownReached}
            autoRedirect={false}
            doConfetti={false}
          />
        </div>

        <div className="banner-description banner-description--italic">
          <p><em>Every year, the same sky. The same day. The same heartbeat in a different world.</em></p>
          <p><em>He doesn’t chase her - he just listens to the silence between their stars.</em></p>
          <p><em>Orbit (2025) follows a man caught in the gravity of a name that time refuses to erase.</em></p>
          <p><em>Because some memories aren’t meant to end - they’re meant to echo.</em></p>
          <p><em>Not every orbit finds its star.  But some never stop trying.</em></p>
        </div>

  <p className="banner-tagline">"Inspired by the moments that never happened."</p>

        <div className="banner-buttons">
          <CTAButton variant="primary" icon="play" label="Play" onClick={handlePlayClick} />
          <CTAButton
            variant="secondary"
            icon="info"
            label="Quiet Note"
            onClick={() => { if (isGalaxy) setQnOpen(true); else handleLinkedinClick(); }}
          />
        </div>
  </div>
  </Hero>
  {/* Netflix-style maturity badge (bottom-right of the whole billboard) */}
  <div id="maturity-badge" className="maturity-badge" aria-label="Age rating">{maturityLabel}</div>

      {isStreaming && (
        <div className="now-streaming-overlay" role="status" aria-live="assertive">
          Now Streaming: Your Day ❤️
        </div>
      )}
  <QuietNoteModal open={qnOpen} onClose={()=>setQnOpen(false)} line={"আমি আর আসবো না এবার তুই আমাকে খুজে নে।"} />
    </div>
  );
};

export default ProfileBanner;
