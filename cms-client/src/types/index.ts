export interface EventItem {
  id: string;
  title: string;
  slug: string;
  date: string;
  formattedDate: string;
  time: string;
  venue: string;
  locationType: 'On-Campus' | 'Online / Discord' | 'Hybrid' | 'External Venue';
  hostType: 'Committee' | 'External / Partner';
  committeeSlug?: string;
  committeeName?: string;
  committeeColor?: string;
  organizer: string;
  organizerLogo?: string;
  category: 'Hackathon' | 'Esports' | 'Workshop' | 'Design Jam' | 'Cybersecurity' | 'Open Source' | 'Seminar';
  price: string;
  image: string;
  featured?: boolean;
  description: string;
  tags: string[];
  registrationUrl?: string;
  prerequisites?: string[];
  speakersOrJudges?: string[];
}

export interface CommitteeItem {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  logo: string;
  focus: string;
  accentColor: string;
  bgGradient: string;
  eventCount: number;
  isUpcoming?: boolean;
  leadOfficer?: string;
}

// Backward compatibility alias
export type DynamicCommittee = CommitteeItem;

export interface FilterOption {
  label: string;
  filter: string;
}

// Global System Defaults
export const DEFAULT_COMMITTEE_COLOR = '#64748b'; // Slate / Stale (Never default to emerald)
export const DEFAULT_COMMITTEE_GRADIENT = 'from-stale-500/20 to-transparent';
export const DEFAULT_COMMITTEE_LOGO = '/logo/Committee/Blank/Logo.png';
export const DEFAULT_ORGANIZER_LOGO = '/logo/CSOLOGO.png';

export const COMMITTEE_INFO: Record<string, { name: string; organizer: string; logo: string; isExternal?: boolean }> = {
  gad: {
    name: 'Graphics and Design (GAD)',
    organizer: 'CSO Graphics & Design Committee',
    logo: '/logo/Committee/GAD/Logo.png',
  },
  gaming: {
    name: 'Gaming Committee',
    organizer: 'CSO Gaming Committee',
    logo: '/logo/Committee/Gaming/Logo.png',
  },
  networking: {
    name: 'Networking Committee',
    organizer: 'CSO Networking Committee',
    logo: '/logo/Committee/Networking/Logo.png',
  },
  programming: {
    name: 'Programming Committee',
    organizer: 'CSO Programming Committee',
    logo: '/logo/Committee/Programming/Logo.png',
  },
  external: {
    name: 'Outside / Featured Event',
    organizer: 'Featured Partner',
    logo: '/logo/CSOLOGO.png',
    isExternal: true,
  },
};

export const COMMITTEE_DEFAULT_COLORS: Record<string, string> = {
  gad: '#f59e0b',
  programming: '#d946ef',
  gaming: '#10b981',
  networking: '#06b6d4',
  external: '#38bdf8',
};

export const DEFAULT_FALLBACK_IMAGES: Record<string, string> = {
  gaming: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
  programming: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
  networking: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80',
  gad: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80',
  external: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
};

export function isValidHttpOrPath(val?: unknown): boolean {
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (!trimmed || trimmed.toUpperCase() === 'TBA' || trimmed.toUpperCase() === 'N/A') return false;
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/');
}

export function resolveEventFields(
  data: Record<string, any>,
  committeesList?: { id?: string; slug?: string; name?: string; logo?: string; accentColor?: string }[],
) {
  const cId = data.committeeId as string | undefined;
  const cSlug = (data.committeeSlug as string) || undefined;

  const matchedComm = committeesList?.find(
    (c) => (cId && c.id === cId) || (cSlug && c.slug?.toLowerCase() === cSlug.toLowerCase()),
  );

  const slug = matchedComm?.slug || cSlug;
  const info = slug ? COMMITTEE_INFO[slug] : undefined;

  const fallbackName = slug
    ? slug.split(/[-_]/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Committee'
    : 'CSO Committee';

  const committeeName = matchedComm?.name || (data.committeeName as string | undefined) || info?.name || fallbackName;
  const committeeColor =
    matchedComm?.accentColor ||
    (data.committeeColor as string | undefined) ||
    (slug ? COMMITTEE_DEFAULT_COLORS[slug] : undefined) ||
    DEFAULT_COMMITTEE_COLOR;

  const organizer = (data.organizer as string | undefined) || (slug ? `CSO ${committeeName}` : 'Computer Studies Organization');
  const organizerLogo = matchedComm?.logo || (data.organizerLogo as string | undefined) || info?.logo || DEFAULT_ORGANIZER_LOGO;
  const hostType = (data.hostType as any) || (info?.isExternal ? 'External / Partner' : 'Committee');

  const rawImage = data.imageUrl as string | undefined;
  const image = isValidHttpOrPath(rawImage)
    ? rawImage!.trim()
    : (slug && DEFAULT_FALLBACK_IMAGES[slug]) || DEFAULT_FALLBACK_IMAGES.gaming;

  const rawReg = data.registrationUrl as string | undefined;
  const registrationUrl = isValidHttpOrPath(rawReg) ? rawReg!.trim() : undefined;

  return {
    committeeSlug: slug,
    committeeName,
    committeeColor,
    organizer,
    organizerLogo,
    hostType,
    image,
    registrationUrl,
  };
}
