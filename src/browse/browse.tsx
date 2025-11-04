import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard';
import './browse.css';
import { useMookyTitle } from '../lib/useMookyTitle';
import { profileMeta, ProfileType, LOCKED_BY_DEFAULT, LOCK_BADGE_TEXT } from '../types';
import { profileRoute } from '../lib/routes';
import { isUnlocked, setUnlocked } from '../lib/locks';
import LockModal from '../components/LockModal';
import '../styles/locks.css';

const Browse: React.FC = () => {
  const navigate = useNavigate();
  // Home-like page title
  useMookyTitle('home');

  const [pendingProfile, setPendingProfile] = React.useState<ProfileType | null>(null);

  const profiles = (Object.keys(profileMeta) as ProfileType[]).map((key) => profileMeta[key]);

  const handleProfileClick = (meta: typeof profiles[number]) => {
    const p = meta.slug as ProfileType;
    const unlocked = !LOCKED_BY_DEFAULT[p] || isUnlocked(p);
    if (unlocked) {
      navigate(profileRoute(p), { state: { profileImage: meta.img, backgroundGif: undefined } });
    } else {
      setPendingProfile(p);
    }
  };

  const handleUnlockSuccess = () => {
    if (!pendingProfile) return;
    // Per-session unlock with 15-minute TTL
    setUnlocked(pendingProfile, true, { session: true, ttlMs: 15 * 60 * 1000 });
    const meta = profileMeta[pendingProfile];
    const p = pendingProfile;
    setPendingProfile(null);
    navigate(profileRoute(p), { state: { profileImage: meta.img, backgroundGif: undefined } });
  };

  return (
    <div className="browse-container">
      <h1 className='who-is-watching'>Where the heart still orbits.</h1>
      <p className='who-subtitle'>Choose a star to follow ✨</p>
      <div className="profiles">
        {profiles.map((meta, index) => {
          const p = meta.slug as ProfileType;
          const unlocked = !LOCKED_BY_DEFAULT[p] || isUnlocked(p);
          return (
            <ProfileCard
              key={index}
              name={meta.label}
              image={meta.img}
              onClick={() => handleProfileClick(meta)}
              locked={!unlocked}
              lockBadgeText={LOCK_BADGE_TEXT}
            />
          );
        })}
      </div>
      {pendingProfile && (
        <LockModal
          profile={pendingProfile}
          onClose={() => setPendingProfile(null)}
          onSuccess={handleUnlockSuccess}
        />
      )}
    </div>
  );
};

export default Browse;
