import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import '../styles/floating-home.css';

export default function FloatingHomeButton(){
  const navigate = useNavigate();
  const location = useLocation();
  const onClick = () => navigate('/browse');
  // Hide on browse/home already
  const hidden = location.pathname === '/browse' || location.pathname === '/';
  if (hidden) return null;
  return (
    <button className="floating-home" aria-label="Back to Home" title="Back to Home" onClick={onClick}>
      <FaHome />
      <span className="label">Home</span>
    </button>
  );
}
