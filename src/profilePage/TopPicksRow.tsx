import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TopPicksRow.css';
import { FaPassport, FaCode, FaBriefcase, FaCertificate, FaHandsHelping, FaProjectDiagram, FaEnvelope, FaMusic, FaBook } from 'react-icons/fa';
import { DISPLAY_TITLES } from '../lib/titles';
import { ProfileType } from '../types';
import { isGateActive, isNavLocked } from '../lib/access';
import AccessDeniedModal from '../components/AccessDeniedModal';

interface TopPicksRowProps {
  profile: ProfileType;
}

const topPicksConfig: Record<ProfileType, Array<{ title: string; imgSrc: string; route: string; icon: JSX.Element }>> = {
  galaxy: [
    { title: "Dawn", imgSrc: "/assets/galaxy/dawn.svg", icon: <FaPassport />, route: "/work-permit" },
  { title: "Halo", imgSrc: "/assets/galaxy/halo.svg", icon: <FaCode />, route: "/moments" },
  { title: "Bloom", imgSrc: "/assets/galaxy/bloom.svg", icon: <FaBriefcase />, route: "/echoes" },
  { title: "Flicker", imgSrc: "/assets/galaxy/flicker.svg", icon: <FaCertificate />, route: "/letters" },
  { title: "Muse", imgSrc: "/assets/galaxy/muse.svg", icon: <FaHandsHelping />, route: "/whisper" },
    { title: "Projects", imgSrc: "https://picsum.photos/seed/projects/250/200", icon: <FaProjectDiagram />, route: "/projects" },
    { title: "Contact Me", imgSrc: "https://picsum.photos/seed/contact/250/200", icon: <FaEnvelope />, route: "/contact-me" }
  ],
  afterglow: [
    { title: "Moments", imgSrc: "https://picsum.photos/seed/coding/250/200", route: "/moments", icon: <FaCode /> },
    { title: "Projects", imgSrc: "https://picsum.photos/seed/development/250/200", route: "/projects", icon: <FaProjectDiagram /> },
    { title: "Letters", imgSrc: "https://picsum.photos/seed/badge/250/200", route: "/letters", icon: <FaCertificate /> },
    { title: "Echoes", imgSrc: "https://picsum.photos/seed/work/250/200", route: "/echoes", icon: <FaBriefcase /> },
    { title: "Whisper", imgSrc: "https://picsum.photos/seed/networking/250/200", route: "/whisper", icon: <FaHandsHelping /> },
    { title: "Contact Me", imgSrc: "https://picsum.photos/seed/connect/250/200", route: "/contact-me", icon: <FaEnvelope /> }
  ],
  constellation: [
    { title: "Whisper", imgSrc: "https://picsum.photos/seed/networking/250/200", route: "/whisper", icon: <FaHandsHelping /> },
    { title: "Contact Me", imgSrc: "https://picsum.photos/seed/call/250/200", route: "/contact-me", icon: <FaEnvelope /> },
    { title: "Projects", imgSrc: "https://picsum.photos/seed/planning/250/200", route: "/projects", icon: <FaProjectDiagram /> },
    { title: "Echoes", imgSrc: "https://picsum.photos/seed/resume/250/200", route: "/echoes", icon: <FaBriefcase /> },
    { title: "Letters", imgSrc: "https://picsum.photos/seed/achievements/250/200", route: "/letters", icon: <FaCertificate /> },
  ],
  gravity: [
    { title: "Music", imgSrc: "https://picsum.photos/seed/music/250/200", route: "/music", icon: <FaMusic /> },
    { title: "Projects", imgSrc: "https://picsum.photos/seed/innovation/250/200", route: "/projects", icon: <FaProjectDiagram /> },
    { title: "Reading", imgSrc: "https://picsum.photos/seed/books/250/200", route: "/reading", icon: <FaBook /> },
    { title: "Contact Me", imgSrc: "https://picsum.photos/seed/connect/250/200", route: "/contact-me", icon: <FaEnvelope /> },
    { title: "Letters", imgSrc: "https://picsum.photos/seed/medal/250/200", route: "/letters", icon: <FaCertificate /> }
  ]
};


const TopPicksRow: React.FC<TopPicksRowProps> = ({ profile }) => {
  const navigate = useNavigate();
  const [deniedOpen, setDeniedOpen] = useState(false);
  const topPicks = topPicksConfig[profile];
  const profileName = DISPLAY_TITLES[profile] || (profile.charAt(0).toUpperCase() + profile.slice(1));
  const isGalaxy = profile === 'galaxy';
  const galaxyCardTitles = ['Dawn', 'Halo', 'Bloom', 'Flicker', 'Muse'];

  return (
    <div className={`top-picks-row ${isGalaxy ? 'galaxy' : ''}`}>
      <h2 className="row-title">{isGalaxy ? 'Her Gallery' : `Top Picks for ${profileName}`}</h2>
      {isGalaxy && (
        <p className="row-subtitle">Where every glance became a story.</p>
      )}
      <div className="card-row">
      {topPicks.map((pick, index) => {
          const displayTitle = isGalaxy && index < galaxyCardTitles.length
            ? galaxyCardTitles[index]
            : pick.title;
          const isGalaxyCard = pick.imgSrc.startsWith('/assets/galaxy');
          return (
          <div 
            key={index} 
            className="pick-card" 
            onClick={(e) => {
              // For Galaxy: always show access denied on the 5 gallery cards
              if (isGalaxyCard && isGateActive()) {
                e.preventDefault();
                setDeniedOpen(true);
                return;
              }
              // For others: respect nav lock list
              if (isNavLocked(pick.route)) {
                e.preventDefault();
                setDeniedOpen(true);
                return;
              }
              navigate(pick.route);
            }}
            style={{ animationDelay: `${index * 0.2}s` }} // Adding delay based on index
          >
            <img src={pick.imgSrc} alt={displayTitle} className="pick-image" />
            <div className="overlay">
              <div className="pick-label">{displayTitle}</div>
            </div>
          </div>
          );
        })}
      </div>
      <AccessDeniedModal open={deniedOpen} onClose={() => setDeniedOpen(false)} />
    </div>
  );
};

export default TopPicksRow;
