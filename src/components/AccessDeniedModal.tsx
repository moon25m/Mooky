import React from 'react';

export default function AccessDeniedModal({ open, onClose }:{ open: boolean; onClose: ()=>void }){
  if (!open) return null;
  return (
    <div className="gate-backdrop" role="dialog" aria-modal="true" aria-label="Access denied">
      <div className="gate-card shake">
        <div className="gate-title">Access Denied</div>
        <p className="gate-text">It’s not for you; you lost your access.</p>
        <button className="gate-btn" onClick={onClose}>Okay</button>
      </div>
    </div>
  );
}
