import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaBriefcase, FaTools, FaProjectDiagram, FaEnvelope, FaStar } from 'react-icons/fa'; // Import icons
import './Navbar.css';
import MookyLogoDefault from './MookyLogoDefault';
import MookyLogoNetflix from './MookyLogoNetflix';
// Removed image logo in favor of brand text
import blueImage from '../images/blue.png';
import { LOCKED_BY_DEFAULT, ProfileType } from '../types';
import { resolveProfileFromSlug } from '../lib/routes';
import { setUnlocked } from '../lib/locks';
import AccessDeniedModal from './AccessDeniedModal';
import { isNavLocked } from '../lib/access';
import '../styles/access-gate.css';

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const profileImage = location.state?.profileImage || blueImage;

  const handleScroll = () => {
    setIsScrolled(window.scrollY > 80);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show the compact Netflix-style brand intro only once per session
  useEffect(() => {
    const seen = sessionStorage.getItem('navIntroSeen');
    if (!seen) {
      setShowIntro(true);
      sessionStorage.setItem('navIntroSeen', '1');
      // Remove the class after the animation completes (defensive)
      const t = setTimeout(() => setShowIntro(false), 2500);
      return () => clearTimeout(t);
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen((open) => !open);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    // Return focus to the menu button for accessibility
    try { menuButtonRef.current?.focus(); } catch {}
  };

  const onNavClick = (path: string, e: React.MouseEvent) => {
    if (isNavLocked(path)) {
      e.preventDefault();
      setShowGate(true);
      return;
    }
    navigate(path);
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-left">
          <Link to="/" className="navbar-logo brand-text brand" aria-label="Mooky home">
            {location.pathname === '/' || location.pathname === '/home' ? (
              <MookyLogoNetflix className={`brand-logo ${showIntro ? 'mooky-animate' : ''}`} variant="compact" />
            ) : (
              <MookyLogoDefault className="brand-logo" />
            )}
          </Link>
          <ul className="navbar-links">
            <li><Link to="/browse" onClick={(e)=>onNavClick('/browse', e)}>Home</Link></li>
            <li><Link to="/echoes" onClick={(e)=>onNavClick('/echoes', e)}>Echoes</Link></li>
            <li><Link to="/moments" onClick={(e)=>onNavClick('/moments', e)}>Moments</Link></li>
            <li><Link to="/letters" onClick={(e)=>onNavClick('/letters', e)}>Letters</Link></li>
            <li><Link to="/whisper" onClick={(e)=>onNavClick('/whisper', e)}>Whisper</Link></li>
            <li><Link to="/wish" onClick={(e)=>onNavClick('/wish', e)}>Wishes</Link></li>
          </ul>
        </div>
        <div className="navbar-right">
          {/* Hamburger menu for mobile */}
          <button
            type="button"
            className="hamburger"
            onClick={toggleSidebar}
            aria-controls="mobile-menu"
            aria-expanded={isSidebarOpen ? 'true' : 'false'}
            aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
            ref={menuButtonRef}
          >
            <div></div>
            <div></div>
            <div></div>
          </button>
          <img
            src={profileImage}
            alt="Profile"
            className="profile-icon"
            onClick={() => {
              // If currently on a locked profile page, relock it and return home
              const path = location.pathname || '';
              if (path.startsWith('/profile/')) {
                const slug = path.split('/')[2] as string | undefined;
                if (slug) {
                  const profile = resolveProfileFromSlug(slug) as ProfileType;
                  if (LOCKED_BY_DEFAULT[profile]) {
                    setUnlocked(profile, false); // relock immediately
                  }
                }
              }
              navigate('/browse');
            }}
          />
        </div>
      </nav>

      {/* Sidebar Overlay */}
  <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={closeSidebar} aria-hidden="true"></div>

      {/* Sidebar (only visible on mobile) */}
      <div
        id="mobile-menu"
        className={`sidebar ${isSidebarOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        ref={sidebarRef}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation();
            closeSidebar();
          }
          if (e.key === 'Tab') {
            const root = sidebarRef.current;
            if (!root) return;
            const focusables = root.querySelectorAll<HTMLElement>('a, button, [tabindex]:not([tabindex="-1"])');
            if (!focusables.length) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey) {
              if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
              }
            } else {
              if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
              }
            }
          }
        }}
      >
        <div className="sidebar-logo brand-text brand" aria-label="Mooky">
          {location.pathname === '/' || location.pathname === '/home' ? (
            <MookyLogoNetflix className={`brand-logo ${showIntro ? 'mooky-animate' : ''}`} variant="compact" />
          ) : (
            <MookyLogoDefault className="brand-logo" />
          )}
        </div>
        <ul>
          <li><Link to="/browse" onClick={(e)=>{closeSidebar(); onNavClick('/browse', e);}}><FaHome aria-hidden="true"/> Home</Link></li>
          <li><Link to="/echoes" onClick={(e)=>{closeSidebar(); onNavClick('/echoes', e);}}><FaBriefcase aria-hidden="true"/> Echoes</Link></li>
          <li><Link to="/moments" onClick={(e)=>{closeSidebar(); onNavClick('/moments', e);}}><FaTools aria-hidden="true"/> Moments</Link></li>
          <li><Link to="/letters" onClick={(e)=>{closeSidebar(); onNavClick('/letters', e);}}><FaProjectDiagram aria-hidden="true"/> Letters</Link></li>
          <li><Link to="/whisper" onClick={(e)=>{closeSidebar(); onNavClick('/whisper', e);}}><FaEnvelope aria-hidden="true"/> Whisper</Link></li>
          <li><Link to="/wish" onClick={(e)=>{closeSidebar(); onNavClick('/wish', e);}}><FaStar aria-hidden="true"/> Wishes</Link></li>
        </ul>
      </div>
      <AccessDeniedModal open={showGate} onClose={()=>setShowGate(false)} />
    </>
  );
};

export default Navbar;
