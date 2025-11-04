import React, { useState, useEffect } from 'react';
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
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
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
          <div className="hamburger" onClick={toggleSidebar}>
            <div></div>
            <div></div>
            <div></div>
          </div>
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
      <div className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={closeSidebar}></div>

      {/* Sidebar (only visible on mobile) */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo brand-text brand" aria-label="Mooky">
          {location.pathname === '/' || location.pathname === '/home' ? (
            <MookyLogoNetflix className={`brand-logo ${showIntro ? 'mooky-animate' : ''}`} variant="compact" />
          ) : (
            <MookyLogoDefault className="brand-logo" />
          )}
        </div>
        <ul>
          <li><Link to="/browse" onClick={(e)=>{closeSidebar(); onNavClick('/browse', e);}}><FaHome /> Home</Link></li>
          <li><Link to="/echoes" onClick={(e)=>{closeSidebar(); onNavClick('/echoes', e);}}><FaBriefcase /> Echoes</Link></li>
          <li><Link to="/moments" onClick={(e)=>{closeSidebar(); onNavClick('/moments', e);}}><FaTools /> Moments</Link></li>
          <li><Link to="/letters" onClick={(e)=>{closeSidebar(); onNavClick('/letters', e);}}><FaProjectDiagram /> Letters</Link></li>
          <li><Link to="/whisper" onClick={(e)=>{closeSidebar(); onNavClick('/whisper', e);}}><FaEnvelope /> Whisper</Link></li>
          <li><Link to="/wish" onClick={(e)=>{closeSidebar(); onNavClick('/wish', e);}}><FaStar /> Wishes</Link></li>
        </ul>
      </div>
      <AccessDeniedModal open={showGate} onClose={()=>setShowGate(false)} />
    </>
  );
};

export default Navbar;
