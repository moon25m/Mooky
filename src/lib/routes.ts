import { PROFILE_SLUGS, ProfileType } from '../types';

// Build a /profile/:slug path from a canonical profile key
export const profileRoute = (p: ProfileType) => `/profile/${PROFILE_SLUGS[p]}`;

// Legacy aliases: keep old slugs working, map to canonical
const LEGACY_MAP: Record<string, ProfileType> = {
  developer: 'afterglow',
  stalker: 'constellation',
  adventure: 'gravity',
  galaxy: 'galaxy',
};

export function resolveProfileFromSlug(slug?: string): ProfileType {
  if (!slug) return 'galaxy';
  const lower = slug.toLowerCase();
  const canonical = (Object.values(PROFILE_SLUGS) as string[]).includes(lower)
    ? (lower as ProfileType)
    : undefined;
  if (canonical) return canonical as ProfileType;
  return LEGACY_MAP[lower] ?? 'galaxy';
}
