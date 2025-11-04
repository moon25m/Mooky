import React, { useEffect, useRef, useState } from 'react';
import { ProfileType } from '../types';

export default function LockModal({
  profile,
  onClose,
  onSuccess,
}: {
  profile: ProfileType;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    // Stricter check: exact phrase, Title Case, two words
    const ok = value.trim() === 'Positive Trust';
    if (ok) {
      setError('');
      onSuccess();
    } else {
      setError('Incorrect passphrase. Exact phrase, two words, Title Case.');
      setAttempts((n) => n + 1);
    }
  }

  function onBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === backdropRef.current) {
      onClose();
    }
  }

  return (
    <div ref={backdropRef} className="lock-backdrop" role="dialog" aria-modal="true" aria-label="Unlock profile" onMouseDown={onBackdropClick}>
      <div ref={cardRef} className="lock-card">
        <div className="lock-title">Enter Passphrase</div>
        <form onSubmit={submit}>
          <input
            ref={inputRef}
            className="lock-input"
            type="password"
            placeholder="Passphrase"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-invalid={error ? true : undefined}
          />
          {error && <div className="lock-error">{error}</div>}
          <div className="lock-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Unlock
            </button>
          </div>
        </form>
        {attempts > 0 && (
          <div className="lock-hint">Hint: two words. The first is a mindset, the second is the vow. Title Case.</div>
        )}
      </div>
    </div>
  );
}
