import { taproot } from './taproot';
import {
  type EventItem,
  type CommitteeItem,
  DEFAULT_COMMITTEE_COLOR,
  DEFAULT_COMMITTEE_LOGO,
  DEFAULT_ORGANIZER_LOGO,
  resolveEventFields,
} from '../types';
import { getDynamicCommittees } from '../data/committees';

/**
 * Safely parse multiline or comma-separated list fields from CMS (prerequisites, speakers, etc.)
 */
export function parseListField(val: unknown): string[] | undefined {
  if (Array.isArray(val)) {
    const list = val.map((s) => String(s).trim()).filter(Boolean);
    return list.length > 0 ? list : undefined;
  }
  if (typeof val === 'string') {
    const raw = val.trim();
    if (!raw || raw.toUpperCase() === 'TBA' || raw.toUpperCase() === 'N/A') return undefined;
    const delimiter = raw.includes('\n') ? '\n' : ',';
    const list = raw
      .split(delimiter)
      .map((s) => s.trim().replace(/^[-*•]\s*/, ''))
      .filter(Boolean);
    return list.length > 0 ? list : undefined;
  }
  return undefined;
}

/**
 * Fetch and normalize committees from Taproot CMS.
 * Partition into active and upcoming lists with calculated event counts.
 */
export async function getCommittees(
  events: { committeeSlug?: string; hostType?: string }[] = [],
): Promise<{
  active: CommitteeItem[];
  upcoming: CommitteeItem[];
  all: CommitteeItem[];
}> {
  let cmsCommittees: CommitteeItem[] = [];

  try {
    const commResult = await taproot.items({ type: 'committee', data: true });
    if (commResult?.items && commResult.items.length > 0) {
      cmsCommittees = commResult.items.map((item: any) => {
        const data = item.data || {};
        const isUp = Boolean(
          data.isUpcoming ??
            (item.slug.includes('upcoming') ||
              item.slug.includes('upcomng') ||
              data.logo === DEFAULT_COMMITTEE_LOGO),
        );

        return {
          id: item.id,
          slug: item.slug,
          name: item.title,
          shortName: (data.shortName as string) || item.title,
          logo: (data.logo as string) || (isUp ? DEFAULT_COMMITTEE_LOGO : DEFAULT_ORGANIZER_LOGO),
          focus: (data.focus as string) || (isUp ? 'Focus and objectives currently being drafted by student committee leaders.' : ''),
          accentColor: (data.accentColor as string) || (data.color as string) || DEFAULT_COMMITTEE_COLOR,
          bgGradient: (data.bgGradient as string) || 'from-stale-500/20 to-transparent',
          leadOfficer: (data.leadOfficer as string) || undefined,
          isUpcoming: isUp,
          eventCount: 0,
        };
      });
    }
  } catch (err) {
    console.error('[API] Failed to fetch committees from CMS, falling back to defaults:', err);
  }

  const all = getDynamicCommittees(events, cmsCommittees);
  const active = all.filter((c) => !c.isUpcoming);
  const upcoming = all.filter((c) => c.isUpcoming);

  return { active, upcoming, all };
}

/**
 * Fetch and normalize all events from Taproot CMS with resolved committee relationships.
 */
export async function getEvents(committeeContext?: CommitteeItem[]): Promise<EventItem[]> {
  let events: EventItem[] = [];

  try {
    let committeesList = committeeContext;
    if (!committeesList) {
      const commResult = await getCommittees();
      committeesList = commResult.all;
    }

    const cmsResult = await taproot.items({ type: 'event', data: true });
    if (cmsResult?.items && cmsResult.items.length > 0) {
      events = cmsResult.items.map((item: any) => {
        const data = item.data ?? {};
        const resolved = resolveEventFields(data, committeesList);

        return {
          id: item.id,
          title: item.title,
          slug: item.slug,
          date: (data.date as string) ?? '2026-10-16',
          formattedDate: (data.formattedDate as string) ?? item.publishedAt ?? 'Upcoming',
          time: (data.time as string) ?? '9:00 AM',
          venue: (data.venue as string) ?? 'Main Building',
          locationType: (data.locationType as any) ?? 'On-Campus',
          hostType: resolved.hostType,
          committeeSlug: resolved.committeeSlug,
          committeeName: resolved.committeeName,
          committeeColor: resolved.committeeColor,
          organizer: resolved.organizer,
          organizerLogo: resolved.organizerLogo,
          category: (data.category as any) ?? 'Workshop',
          price: (data.price as string) ?? 'Free Entry',
          image: resolved.image,
          featured: Boolean(data.featured),
          description: (data.description as string) ?? item.title,
          tags: Array.isArray(data.tags) ? data.tags : ['CSO', 'Tech'],
          prerequisites: parseListField(data.prerequisites),
          speakersOrJudges: parseListField(data.speakersOrJudges),
          registrationUrl: resolved.registrationUrl,
        };
      });
    }
  } catch (err) {
    console.error('[API] Failed to fetch events from CMS:', err);
  }

  return events;
}

/**
 * Fetch an individual event by its slug.
 */
export async function getEventBySlug(slug: string): Promise<EventItem | undefined> {
  const events = await getEvents();
  return events.find((e) => e.slug === slug);
}
