import React, { useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import './ProfilePage.css';

import ProfileBanner from './ProfileBanner';
import TopPicksRow from './TopPicksRow';
import ContinueWatching from './ContinueWatching';
import { ProfileType, LOCKED_BY_DEFAULT } from '../types';
import { resolveProfileFromSlug } from '../lib/routes';
import { isUnlocked } from '../lib/locks';

const ProfilePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profileName } = useParams<{ profileName: string }>();

  // Prefer GIF passed via navigation state; otherwise choose sensible defaults per profile
  const routeGif: string | undefined = location.state?.backgroundGif;
  const fallbackGeneric = "https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif"; // Generic fallback
  const providedGif = "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWl5eDZnMzlscDBrcHV2YXV3NjFtdHNxeGo2NjNhdno4ZDI1d3RkYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/F1cehBDCMnsukCPUXo/giphy.gif";
  const fallbackByProfile: Record<string, string> = {
    galaxy: providedGif,
    afterglow: providedGif,
    constellation: providedGif,
    gravity: providedGif,
  };
  const backgroundGif = routeGif || fallbackByProfile[profileName ?? ''] || fallbackGeneric;

  const profile: ProfileType = resolveProfileFromSlug(profileName);

  // Gate protected profiles: redirect home if locked and not unlocked
  useEffect(() => {
    if (LOCKED_BY_DEFAULT[profile] && !isUnlocked(profile)) {
      navigate('/', { replace: true });
    }
  }, [profile, navigate]);
  return (
    <>
      <div
        className="profile-page"
        style={{ backgroundImage: `url(${backgroundGif})` }}
      >
        <ProfileBanner
        />
      </div>
      <TopPicksRow profile={profile} />
      <ContinueWatching profile={profile} />
    </>
  );
};

export default ProfilePage;
