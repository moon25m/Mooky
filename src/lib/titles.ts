export const DISPLAY_TITLES: Record<string, string> = {
  home: 'Home',
  galaxy: 'Galaxy',
  afterglow: 'Afterglow',
  constellation: 'Constellation',
  gravity: 'Gravity',
  letters: 'Letters',
  moments: 'Moments',
  echoes: 'Echoes',
  whisper: 'Whisper',
  // App pages
  browse: 'Home',
  'work-permit': 'Work Permit',
  'work-experience': 'Work Experience',
  recommendations: 'Whisper',
  skills: 'Moments',
  projects: 'Projects',
  'contact-me': 'Contact',
  music: 'Music',
  reading: 'Reading',
  blogs: 'Blogs',
  certifications: 'Letters'
};

export function pageTitle(key?: string) {
  const label = (key && DISPLAY_TITLES[key]) || key || 'Mooky';
    return label === 'Mooky' ? 'Mooky' : `Mooky – ${label}`;
}
