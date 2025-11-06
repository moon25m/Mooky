// small admin helpers: set cookie from URL hash and check admin cookie
export function setAdminFromHash() {
  if (typeof window === 'undefined') return;
  if (process.env.NODE_ENV === 'production') return; // Do not allow URL-hash admin activation in prod
  try {
    const hash = window.location.hash || '';
    const m = hash.match(/#admin=(.+)/);
    if (!m) return;
    const pass = decodeURIComponent(m[1] || '');
    // If an env var is present, prefer validating against it. CRA uses REACT_APP_ prefix.
    const expected = (process.env.REACT_APP_MOOKY_ADMIN_PASS || (process.env as any).NEXT_PUBLIC_MOOKY_ADMIN_PASS || '');
    if (expected && pass !== expected) return; // don't set if mismatch
    // set cookie for 12 hours
    const maxAge = 12 * 60 * 60;
    document.cookie = `mooky_admin=1; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
    // Remove hash from URL to avoid leaking token in history
     try { window.history.replaceState(null, '', window.location.pathname + window.location.search); } catch {}
  } catch {}
}

export function isAdmin() {
  if (typeof document === 'undefined') return false;
  try {
    const v = document.cookie.split(';').map(s=>s.trim()).find(s=>s.startsWith('mooky_admin='));
    if (!v) return false;
    const val = v.split('=')[1];
    return val === '1' || val === 'true';
  } catch { return false; }
}
