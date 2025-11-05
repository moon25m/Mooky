import React, { useEffect, useRef, useState } from 'react';
import '../styles/quiet-note.css';

export default function QuietNoteModal({
  open,
  onClose,
  line = "Right now, finding me is your task — because I’m invisible to the world."
}:{
  open: boolean;
  onClose: () => void;
  line?: string;
}) {
  const [typed, setTyped] = useState('');
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) { setTyped(''); return; }
    let i = 0;
    const speed = 24; // ms per char
    const id = setInterval(() => {
      i++;
      setTyped(line.slice(0, i));
      if (i >= line.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [open, line]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function copyLine() {
    try {
      await navigator.clipboard.writeText(line);
      const el = boxRef.current;
      if (el) {
        el.classList.remove('qn-copied');
        // trigger reflow to restart animation
        // @ts-ignore
        void el.offsetWidth;
        el.classList.add('qn-copied');
      }
    } catch {}
  }

  return (
    <div className="qn-backdrop" role="dialog" aria-modal="true" aria-label="Quiet note" onClick={onClose}>
      <div className="qn-card" onClick={(e)=>e.stopPropagation()} ref={boxRef}>
        <div className="qn-title">Quiet Note</div>
        <p className="qn-line" aria-live="polite">
          <span className="qn-type">{typed}</span>
          <span className="qn-cursor">▋</span>
        </p>
        <div className="qn-actions">
          <button className="qn-btn qn-secondary" onClick={copyLine} aria-label="Copy note">Copy</button>
          <button className="qn-btn qn-primary" onClick={onClose} autoFocus>Close</button>
        </div>
        <div className="qn-hint">Press Esc to close</div>
      </div>
    </div>
  );
}
