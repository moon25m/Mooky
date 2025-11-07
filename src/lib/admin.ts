// Admin helpers using sessionStorage and URL parsing.
export const ADMIN_KEY = 'mooky_admin_pass';

export function getAdminPass(): string | null {
  if (typeof window === 'undefined') return null;
  try { return window.sessionStorage.getItem(ADMIN_KEY); } catch { return null; }
}

export function setAdminPass(pass: string) {
  if (typeof window === 'undefined') return;
  try { window.sessionStorage.setItem(ADMIN_KEY, pass); } catch {}
}

export function clearAdminPass() {
  if (typeof window === 'undefined') return;
  try { window.sessionStorage.removeItem(ADMIN_KEY); } catch {}
}

export function extractAdminFromLocation(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const fromHash = (window.location.hash.match(/(?:^|[&#])admin=([^&]+)/)?.[1]) || null;
    const fromQuery = (new URLSearchParams(window.location.search)).get('admin');
    const raw = fromHash || fromQuery || '';
    if (!raw) return null;
    try { return decodeURIComponent(raw); } catch { return raw; }
  } catch { return null; }
}

export function stripAdminFromUrl() {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    // remove admin from hash
    url.hash = url.hash.replace(/(#|&)admin=[^&]*/g, '').replace(/^#&?$/, '');
    // remove admin from search params
    url.searchParams.delete('admin');
    try { window.history.replaceState({}, '', url.toString()); } catch {}
  } catch {}
}
