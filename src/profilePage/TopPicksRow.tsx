import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TopPicksRow.css';
import { FaPassport, FaCode, FaBriefcase, FaCertificate, FaHandsHelping, FaProjectDiagram, FaEnvelope, FaMusic, FaBook, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
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
    { title: "Brew", imgSrc: "/assets/galaxy/brew.svg", icon: <FaProjectDiagram />, route: "/projects" },
    { title: "Beacon", imgSrc: "/assets/galaxy/beacon.svg", icon: <FaEnvelope />, route: "/contact-me" }
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
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const topPicks = topPicksConfig[profile];
  const profileName = DISPLAY_TITLES[profile] || (profile.charAt(0).toUpperCase() + profile.slice(1));
  const isGalaxy = profile === 'galaxy';
  const galaxyCardTitles = ['Dawn', 'Halo', 'Bloom', 'Flicker', 'Muse'];

  const scrollBy = (dir: -1 | 1) => {
    const node = scrollerRef.current;
    if (!node) return;
    const amount = Math.max(node.clientWidth * 0.9, 320);
    node.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  return (
    <section className={`top-picks-row ${isGalaxy ? 'galaxy' : ''}`} aria-label={isGalaxy ? 'Her Gallery' : `Top Picks for ${profileName}`}>
      <div className="row-head">
        <h2 className="row-title">{isGalaxy ? 'Her Gallery' : `Top Picks for ${profileName}`}</h2>
        <div className="row-nav">
          <button className="rail-nav rail-nav--prev" aria-label="Scroll previous" onClick={() => scrollBy(-1)}>
            <FaChevronLeft />
          </button>
          <button className="rail-nav rail-nav--next" aria-label="Scroll next" onClick={() => scrollBy(1)}>
            <FaChevronRight />
          </button>
        </div>
      </div>
      {isGalaxy && (
        <p className="row-subtitle">Where every glance became a story.</p>
      )}
      <div className="card-row rail-scroller" ref={scrollerRef} tabIndex={0}>
      {topPicks.map((pick, index) => {
          const displayTitle = isGalaxy && index < galaxyCardTitles.length
            ? galaxyCardTitles[index]
            : pick.title;
          // Gate all Galaxy cards (including Brew/Beacon) for a unified experience
          const isGalaxyCard = isGalaxy;
          return (
          <div 
            key={index} 
            className="pick-card rail-card" 
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                (e.currentTarget as HTMLElement).click();
              }
            }}
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
            // Using data attribute instead of inline style to avoid style warnings
            data-i={index}
          >
            <div className="rail-card-media">
              <img src={pick.imgSrc} alt={displayTitle} className="pick-image" loading="lazy" />
              <div className="rail-card-bottom">
                <div className="pick-label">{displayTitle}</div>
              </div>
              <div className="rail-card-hover" aria-hidden="true">
                <span className="hover-pill">Open</span>
              </div>
            </div>
          </div>
          );
        })}
      </div>
      <div className="rail-mask" aria-hidden="true" />
      <AccessDeniedModal open={deniedOpen} onClose={() => setDeniedOpen(false)} />
    </section>
  );
};

export default TopPicksRow;
