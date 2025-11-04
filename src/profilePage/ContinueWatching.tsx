import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ContinueWatching.css';
import { DISPLAY_TITLES } from '../lib/titles';
import { ProfileType } from '../types';
import AccessDeniedModal from '../components/AccessDeniedModal';
import { isGateActive } from '../lib/access';

interface ContinueWatchingProps {
  profile: ProfileType;
}

const continueWatchingConfig: Record<ProfileType, Array<{ title: string; imgSrc: string; link: string }>> = {
  galaxy: [
    { title: "Echo", imgSrc: "/assets/galaxy/echo.svg", link: "/music" },
    { title: "Fade", imgSrc: "/assets/galaxy/fade.svg", link: "/reading" },
    { title: "Whisper", imgSrc: "/assets/galaxy/whisper.svg", link: "/blogs" },
    { title: "Glow", imgSrc: "/assets/galaxy/glow.svg", link: "/contact-me" }
  ],
  afterglow: [
    { title: "Music", imgSrc: "https://picsum.photos/id/1025/300/200", link: "/music" },
    { title: "Reading", imgSrc: "https://picsum.photos/id/1026/300/200", link: "/reading" },
    { title: "Blogs", imgSrc: "https://picsum.photos/id/1027/300/200", link: "/blogs" },
    { title: "Letters", imgSrc: "https://picsum.photos/id/1028/300/200", link: "/letters" },
    { title: "Contact Me", imgSrc: "https://picsum.photos/id/1029/300/200", link: "/contact-me" }
  ],
  constellation: [
    { title: "Reading", imgSrc: "https://picsum.photos/id/1026/300/200", link: "/reading" },
    { title: "Blogs", imgSrc: "https://picsum.photos/id/1027/300/200", link: "/blogs" },
    { title: "Contact Me", imgSrc: "https://picsum.photos/id/1029/300/200", link: "/contact-me" }
  ],
  gravity: [
    { title: "Music", imgSrc: "https://picsum.photos/id/1025/300/200", link: "/music" },
    { title: "Reading", imgSrc: "https://picsum.photos/id/1026/300/200", link: "/reading" },
    { title: "Letters", imgSrc: "https://picsum.photos/id/1028/300/200", link: "/letters" },
    { title: "Contact Me", imgSrc: "https://picsum.photos/id/1029/300/200", link: "/contact-me" }
  ]
};

const ContinueWatching: React.FC<ContinueWatchingProps> = ({ profile }) => {
  const continueWatching = continueWatchingConfig[profile];
  const profileName = DISPLAY_TITLES[profile] || (profile.charAt(0).toUpperCase() + profile.slice(1));
  const isGalaxy = profile === 'galaxy';
  const galaxyCardTitles = ['Echo', 'Fade', 'Whisper', 'Glow'];
  const [deniedOpen, setDeniedOpen] = useState(false);

  return (
    <div className={`continue-watching-row ${isGalaxy ? 'galaxy' : ''}`}>
      <h2 className="row-title">{isGalaxy ? 'Moments That Still Glow' : `Continue Exploring ${profileName}`}</h2>
      {isGalaxy && (
        <p className="row-subtitle">Not every moment fades — some just learn to stay quiet.</p>
      )}
      <div className="card-row">
        {continueWatching.map((pick, index) => {
          const displayTitle = isGalaxy && index < galaxyCardTitles.length
            ? galaxyCardTitles[index]
            : pick.title;
          return (
          <Link 
            to={pick.link} 
            key={index} 
            className="pick-card"
            onClick={(e)=>{
              if (isGalaxy && isGateActive()) {
                e.preventDefault();
                setDeniedOpen(true);
              }
            }}
          >
            <img src={pick.imgSrc} alt={displayTitle} className="pick-image" />
            <div className="overlay">
              <div className="pick-label">{displayTitle}</div>
            </div>
          </Link>
          );
        })}
      </div>
      <AccessDeniedModal open={deniedOpen} onClose={() => setDeniedOpen(false)} />
    </div>
  );
};

export default ContinueWatching;
