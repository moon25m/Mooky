import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { DISPLAY_TITLES, pageTitle } from './titles';

/**
 * Sets document.title to "Mooky – {Section}" using route params or path.
 * - For /profile/:profileName uses the :profileName param
 * - Otherwise uses the first path segment (e.g., skills, projects, etc.)
 * - Falls back to "Mooky"
 */
export function useMookyTitle(defaultKey?: string) {
  const params = useParams();
  const loc = useLocation();

  useEffect(() => {
    // Extract key from profile param or from first path segment
    const path = loc.pathname.replace(/^\/+/, ''); // remove leading slash
  const [firstSeg] = path.split('/');

    // Prefer explicit profileName param if present
    const paramKey = (params as any).profileName || (params as any).slug;

    // Determine lookup key
    let key: string | undefined = paramKey || firstSeg || defaultKey;

    // Map / to home when defaultKey isn't provided and path is empty
    if (!key && loc.pathname === '/') {
      key = 'home';
    }

    // Normalize: sometimes routes are /profile/:k -> we already handled param
    // For /browse treat as home
    if (key === 'browse') key = 'home';

    const label = (key && DISPLAY_TITLES[key]) || key || 'Mooky';
    document.title = pageTitle(label);
  }, [params, loc, defaultKey]);
}
