export const LOCK_ALL_BUT_HOME = true;

// Support both friendly aliases and actual app routes
export const LOCKED_NAV_ROUTES = [
  // Final app routes aligned to theme
  '/echoes', '/moments', '/letters', '/whisper',
];

export function isGateActive(): boolean {
  try {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const gateParam = params.get('gate');
      if (gateParam === 'off') return false;
      if (gateParam === 'on') return true;
      const ls = window.localStorage?.getItem('mookyAccessGate');
      if (ls && ls.toLowerCase() === 'off') return false;
    }
  } catch {
    // ignore
  }
  return !!LOCK_ALL_BUT_HOME;
}

export function isNavLocked(path: string) {
  // Honor global kill-switches and runtime toggles
  if (!isGateActive()) return false;
  try {
    const u = new URL(path, 'http://local');
    path = u.pathname;
  } catch {
    // ignore
  }
  return LOCKED_NAV_ROUTES.includes(path);
}
