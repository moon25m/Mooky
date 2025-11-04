import React from 'react';
import './ProfileCard.css';

interface ProfileCardProps {
  name: string;
  image: string;
  onClick: () => void;
  locked?: boolean;
  lockBadgeText?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ name, image, onClick, locked = false, lockBadgeText }) => {
  return (
    <div className={`profile-card ${locked ? 'is-locked' : ''}`} onClick={onClick}>
      <div className="image-container">
        <img src={image} alt={`${name} profile`} className="profile-image" />
        {locked && (
          <div className="lock-badge" aria-hidden="true">
            <svg className="lock-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 10V8a6 6 0 1112 0v2h1a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1v-9a1 1 0 011-1h1zm2 0h8V8a4 4 0 10-8 0v2z"/></svg>
            <span>{lockBadgeText || 'Locked'}</span>
          </div>
        )}
      </div>
      <h3 className="profile-name">{name}</h3>
    </div>
  );
};

export default ProfileCard;
