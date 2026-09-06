import {
  type CommitteeItem,
  type DynamicCommittee,
  DEFAULT_COMMITTEE_COLOR,
  DEFAULT_COMMITTEE_GRADIENT,
  DEFAULT_COMMITTEE_LOGO,
} from '../types';

export type { CommitteeItem, DynamicCommittee };

export const BASE_COMMITTEES: Record<
  string,
  { name: string; shortName: string; logo: string; focus: string; accentColor: string; bgGradient: string }
> = {
  programming: {
    name: 'Programming Committee',
    shortName: 'Programming',
    logo: '/logo/Committee/Programming/Logo.png',
    focus: 'Leading web & mobile development, competitive coding, hackathons, API integrations, and code reviews.',
    accentColor: '#d946ef', // Fuchsia / Purple
    bgGradient: 'from-fuchsia-500/20 via-purple-500/10 to-transparent',
  },
  gaming: {
    name: 'Gaming Committee',
    shortName: 'Gaming',
    logo: '/logo/Committee/Gaming/Logo.png',
    focus: 'Organizing esports tournaments, game development workshops, shoutcasting, and campus gaming events.',
    accentColor: '#10b981', // Emerald / Neon Green
    bgGradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
  },
  networking: {
    name: 'Networking Committee',
    shortName: 'Networking',
    logo: '/logo/Committee/Networking/Logo.png',
    focus: 'Managing event network infrastructure, server management, cybersecurity, IoT setups, and hardware.',
    accentColor: '#06b6d4', // Cyan / Electric Blue
    bgGradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
  },
  gad: {
    name: 'Graphics and Design (GAD)',
    shortName: 'GAD',
    logo: '/logo/Committee/GAD/Logo.png',
    focus: 'Spearheading visual identity, UI/UX prototyping, event posters, motion graphics, and media branding.',
    accentColor: '#f59e0b', // Amber / Gold
    bgGradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
  },
};

export function getDynamicCommittees(
  events: { committeeSlug?: string; hostType?: string }[] = [],
  cmsCommittees: CommitteeItem[] = [],
): CommitteeItem[] {
  const countMap = new Map<string, number>();
  for (const ev of events) {
    if (ev.committeeSlug && ev.hostType !== 'External / Partner') {
      const s = ev.committeeSlug.toLowerCase();
      countMap.set(s, (countMap.get(s) || 0) + 1);
    }
  }

  // If CMS returned committees, use them as primary source
  if (cmsCommittees.length > 0) {
    return cmsCommittees.map((c) => ({
      ...c,
      accentColor: c.accentColor || BASE_COMMITTEES[c.slug.toLowerCase()]?.accentColor || DEFAULT_COMMITTEE_COLOR,
      bgGradient: c.bgGradient || BASE_COMMITTEES[c.slug.toLowerCase()]?.bgGradient || DEFAULT_COMMITTEE_GRADIENT,
      logo: c.logo || (c.isUpcoming ? DEFAULT_COMMITTEE_LOGO : BASE_COMMITTEES[c.slug.toLowerCase()]?.logo || DEFAULT_COMMITTEE_LOGO),
      eventCount: countMap.get(c.slug.toLowerCase()) || 0,
      isUpcoming: Boolean(c.isUpcoming),
      leadOfficer: c.leadOfficer,
    }));
  }

  const slugs = new Set([...Object.keys(BASE_COMMITTEES), ...countMap.keys()]);
  const result: CommitteeItem[] = [];

  for (const slug of slugs) {
    const base = BASE_COMMITTEES[slug];
    const formattedName = slug
      .split(/[-_]/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    result.push({
      id: slug,
      slug,
      name: base?.name ?? `${formattedName} Committee`,
      shortName: base?.shortName ?? formattedName,
      logo: base?.logo ?? DEFAULT_COMMITTEE_LOGO,
      focus:
        base?.focus ??
        `Organizing official ${formattedName} department activities, specialized workshops, and student engagements.`,
      accentColor: base?.accentColor ?? DEFAULT_COMMITTEE_COLOR,
      bgGradient: base?.bgGradient ?? DEFAULT_COMMITTEE_GRADIENT,
      eventCount: countMap.get(slug) || 0,
    });
  }

  return result;
}

export const committees = getDynamicCommittees();
