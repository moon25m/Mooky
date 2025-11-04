// types.ts

export interface ProfileBanner {
  backgroundImage: { url: string };
  headline: string;
  resumeLink: {
    url: string;
  };
  linkedinLink: string;
  profileSummary: string;
}

export interface WorkPermit {
  visaStatus: string;
  expiryDate: Date;
  summary: string;
  additionalInfo: string;
}

export interface TimelineItem {
  timelineType: 'work' | 'education';
  name: string;
  title: string;
  techStack: string;
  summaryPoints: string[];
  dateRange: string;
}

export interface Project {
  title: string;
  description: string;
  techUsed: string;
  image: { url: string };
}

export interface Certification {
  title: string;
  issuer: string;
  issuedDate: string;
  link: string;
  iconName: string;
}

export interface ContactMe {
  profilePicture: { url: string };
  name: string;
  title: string;
  summary: string;
  companyUniversity: string;
  linkedinLink: string;
  email: string;
  phoneNumber: string;
}

export interface Skill { 
  name: string;
  category: string;
  description: string;
  icon: string;
}

// ---- Profiles (centralized) ----
export type ProfileType = 'galaxy' | 'afterglow' | 'constellation' | 'gravity';

export const PROFILE_SLUGS: Record<ProfileType, string> = {
  galaxy: 'galaxy',
  afterglow: 'afterglow',
  constellation: 'constellation',
  gravity: 'gravity',
};

// Lock configuration: Galaxy is always unlocked; others locked by default
export const LOCKED_BY_DEFAULT: Record<ProfileType, boolean> = {
  galaxy: false,
  afterglow: true,
  constellation: true,
  gravity: true,
};

// Optional: label to display on locked cards
export const LOCK_BADGE_TEXT = 'Locked';

// Local placeholder SVGs under /public/assets/profiles
const localAsset = (slug: string) => `/assets/profiles/${slug}.svg`;

export const profileMeta: Record<ProfileType, {
  label: string;
  slug: string;
  img: string;        // 200–300px square recommended
  alt: string;
  tagline?: string;
}> = {
  galaxy:       { label: 'Galaxy',        slug: PROFILE_SLUGS.galaxy,        img: localAsset('galaxy'),        alt: 'Galaxy profile',        tagline: 'The beginning' },
  afterglow:    { label: 'Afterglow',     slug: PROFILE_SLUGS.afterglow,     img: localAsset('afterglow'),     alt: 'Afterglow profile',     tagline: 'The distance' },
  constellation:{ label: 'Constellation', slug: PROFILE_SLUGS.constellation, img: localAsset('constellation'), alt: 'Constellation profile', tagline: 'The fate' },
  gravity:      { label: 'Gravity',       slug: PROFILE_SLUGS.gravity,       img: localAsset('gravity'),       alt: 'Gravity profile',       tagline: 'The pull' },
};
