import React, { useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import './ProfilePage.css';

import ProfileBanner from './ProfileBanner';
import TopPicksRow from './TopPicksRow';
import ContinueWatching from './ContinueWatching';
import { ProfileType, LOCKED_BY_DEFAULT } from '../types';
import { resolveProfileFromSlug } from '../lib/routes';
import { isUnlocked } from '../lib/locks';
import SafeArea from '../components/SafeArea';
import Container from '../components/Container';
import StageControls from '../components/StageControls';

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
    <SafeArea>
      <Container>
        <div
          className="profile-page"
          style={{ backgroundImage: `url(${backgroundGif})` }}
        >
          <ProfileBanner />
        </div>

        {/* Hero section with avatar + title + chips (Netflix style) */}
        <section className="mt-6 md:mt-8">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6">
            {/* Avatar box */}
            <div className="h-24 w-24 md:h-28 md:w-28 rounded-2xl bg-gradient-to-br from-red-600 to-red-400 shadow-lg grid place-items-center text-3xl font-black">
              {(profileName || 'M')[0]?.toUpperCase?.()}
            </div>
            {/* Title + chips */}
            <div className="flex-1">
              <h1 className="m-0 text-[clamp(28px,4vw,52px)] font-extrabold leading-tight">
                {profileName}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-neutral-300">
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1">Cinematic</span>
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1">Responsive</span>
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1">Safe‑area</span>
              </div>
            </div>
          </div>
        </section>

        {/* Media Stage */}
        <section className="mt-6 md:mt-8">
          <div id="profile-stage" className="relative w-full aspect-video bg-black overflow-hidden rounded-xl md:rounded-2xl shadow-2xl relax-aspect landscape-tight">
            {/* You can place an image/video/canvas here; show a poster using the banner */}
            <img src={backgroundGif} alt="Profile stage" className="h-full w-full object-cover select-none" />
            <StageControls targetId="profile-stage" />
          </div>
        </section>

        {/* Highlights grid */}
        <section className="mt-6 md:mt-8">
          <h2 className="mb-3 text-xl font-semibold">Highlights</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <a href="/echoes" className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition">
              <div className="text-lg font-semibold">Echoes</div>
              <p className="m-0 text-sm text-neutral-300">Work experience & education timeline</p>
            </a>
            <a href="/moments" className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition">
              <div className="text-lg font-semibold">Moments</div>
              <p className="m-0 text-sm text-neutral-300">Skills and tools I enjoy</p>
            </a>
            <a href="/letters" className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition">
              <div className="text-lg font-semibold">Letters</div>
              <p className="m-0 text-sm text-neutral-300">Certifications & achievements</p>
            </a>
          </div>
        </section>

        <TopPicksRow profile={profile} />
        <ContinueWatching profile={profile} />
      </Container>
    </SafeArea>
  );
};

export default ProfilePage;
