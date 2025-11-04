import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NetflixTitle from './NetflixTitle';
import ProfilePage from './profilePage/profilePage';
import Browse from './browse/browse';
import WorkPermit from './pages/WorkPermit';
import WorkExperience from './pages/WorkExperience';
import Recommendations from './pages/Recommendations';
import Skills from './pages/Skills';
import Projects from './pages/Projects';
import ContactMe from './pages/ContactMe';
import Layout from './Layout';
import Music from './pages/Music';
import Reading from './pages/Reading';
import Blogs from './pages/Blogs';
import Certifications from './pages/Certifications';
import Wish from './pages/Wish';
import Surprise from './pages/Surprise';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<NetflixTitle />} />
      <Route path="/browse" element={<Browse />} />
  {/* Legacy redirect: preserve old links */}
  <Route path="/profile/recruiter" element={<Navigate to="/profile/galaxy" replace />} />
  <Route path="/profile/developer" element={<Navigate to="/profile/afterglow" replace />} />
  <Route path="/profile/stalker" element={<Navigate to="/profile/constellation" replace />} />
  <Route path="/profile/adventure" element={<Navigate to="/profile/gravity" replace />} />
  <Route path="/profile/:profileName" element={<Layout><ProfilePage /></Layout>} />
  <Route path="/work-permit" element={<Layout><WorkPermit /></Layout>} />
  {/* Themed routes */}
  <Route path="/echoes" element={<Layout><WorkExperience /></Layout>} />
  <Route path="/whisper" element={<Layout><Recommendations /></Layout>} />
  <Route path="/moments" element={<Layout><Skills /></Layout>} />
  <Route path="/letters" element={<Layout><Certifications /></Layout>} />
  <Route path="/wish" element={<Layout><Wish /></Layout>} />
  <Route path="/surprise" element={<Layout><Surprise /></Layout>} />
  {/* Legacy redirects */}
  <Route path="/work-experience" element={<Navigate to="/echoes" replace />} />
  <Route path="/recommendations" element={<Navigate to="/whisper" replace />} />
  <Route path="/skills" element={<Navigate to="/moments" replace />} />
  <Route path="/certifications" element={<Navigate to="/letters" replace />} />
  {/* Other pages */}
  <Route path="/projects" element={<Layout><Projects /></Layout>} />
  <Route path="/contact-me" element={<Layout><ContactMe /></Layout>} />
      <Route path="/music" element={<Layout><Music /></Layout>} />
      <Route path="/reading" element={<Layout><Reading /></Layout>} />
      <Route path="/blogs" element={<Layout><Blogs /></Layout>} />
      <Route path="/certifications" element={<Layout><Certifications /></Layout>} />
    </Routes>
  );
};

export default App;
