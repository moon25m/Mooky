import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileBanner.css';
import PlayButton from '../components/PlayButton';
import MoreInfoButton from '../components/MoreInfoButton';
import { getProfileBanner } from '../queries/getProfileBanner';
import { ProfileBanner as ProfileBannerType } from '../types';
import BirthdayCountdown from '../components/BirthdayCountdown.jsx';
import confetti from 'canvas-confetti';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

const ProfileBanner: React.FC = () => {
  const navigate = useNavigate();


  const [bannerData, setBannerData] = useState<ProfileBannerType | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [maturityLabel, setMaturityLabel] = useState<string>('TV-22');

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
      {/* Cinematic overlays */}
      <div className="banner-overlay-gradient" aria-hidden="true"></div>
      <div className="banner-overlay-redglow" aria-hidden="true"></div>

      {/* Netflix-style maturity badge (bottom-right of the whole billboard) */}
      <div id="maturity-badge" className="maturity-badge" aria-label="Age rating">{maturityLabel}</div>

      <div className="banner-content">
        <h1 className="hero-title" id='headline'>
          ORBIT (2025)
          <br />
          <span className="subtitle">A Story That Never Reached Its Star</span>
        </h1>

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
          <PlayButton onClick={handlePlayClick} label="Play" />
          <MoreInfoButton onClick={handleLinkedinClick} label="Quiet Note" />
        </div>

      </div>

      {isStreaming && (
        <div className="now-streaming-overlay" role="status" aria-live="assertive">
          Now Streaming: Your Day ❤️
        </div>
      )}
    </div>
  );
};

export default ProfileBanner;
