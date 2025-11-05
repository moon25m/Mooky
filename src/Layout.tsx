import React from 'react';
import Navbar from './components/NavBar';
import { useMookyTitle } from './lib/useMookyTitle';
import FloatingHomeButton from './components/FloatingHomeButton';
import { useLocation } from 'react-router-dom';
import SafeArea from './components/layout/SafeArea';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Set the document title for all pages wrapped by Layout
  useMookyTitle();
  const location = useLocation();
  const hideNavbar = location.pathname === '/surprise';
  const showHomeFab = location.pathname === '/surprise';
  return (
    <div>
      {!hideNavbar && <Navbar />}
      <SafeArea>
        {/* Offset for fixed navbar when visible; minimal on Surprise */}
        <div className={!hideNavbar ? 'pt-20' : ''}>
          {children}
        </div>
      </SafeArea>
      {showHomeFab && <FloatingHomeButton />}
    </div>
  );
};

export default Layout;
