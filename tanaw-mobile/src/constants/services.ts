import { Ionicons } from '@expo/vector-icons';
import { COLORS } from './colors';
import { ESERVICES_PORTAL_URL } from './urls';

type Icon = keyof typeof Ionicons.glyphMap;

// ─── Shapes ──────────────────────────────────────────────

/** Top of Services tab: "What would you like to do?" horizontal tiles. */
export interface QuickAction {
  key: string;
  name: string;
  subtitle: string;
  icon: Icon;
  bg: string;
  iconColor: string;
  phase: string;
  url?: string;
  keywords?: string[];
}

/** Middle of Services tab: bento grid of government service categories. */
export interface ExploreCategory {
  key: string;
  name: string;
  subtitle: string;
  icon: Icon;
  iconColor: string;
  tint: string;
  phase: string;
  /** true = spans full width; false = half width. Creates the bento rhythm. */
  featured?: boolean;
  url?: string;
  keywords?: string[];
}

/** Below Explore: row of 4 quick link pills. */
export interface QuickLink {
  key: string;
  label: string;
  icon: Icon;
  iconBg: string;
  iconColor: string;
  phase: string;
  url?: string;
  keywords?: string[];
}

// ─── Data ────────────────────────────────────────────────

export const QUICK_ACTIONS: QuickAction[] = [
  { key: 'online-sidera', name: 'Online SideRA', subtitle: 'Ask. Report. Solve.', icon: 'business', bg: COLORS.BLUE_LIGHT, iconColor: COLORS.BLUE, phase: '', url: ESERVICES_PORTAL_URL, keywords: ['eservices', 'portal'] },
  { key: 'business', name: 'Business', subtitle: 'Permits & Services', icon: 'briefcase', bg: COLORS.SUCCESS_LIGHT, iconColor: COLORS.SUCCESS, phase: '', url: ESERVICES_PORTAL_URL, keywords: ['permit', 'bplo'] },
  { key: 'documents', name: 'Documents', subtitle: 'Request & Track', icon: 'document-text', bg: COLORS.PRIMARY_LIGHT, iconColor: COLORS.PRIMARY, phase: 'Phase 2', keywords: ['certificate', 'clearance'] },
  { key: 'appointments', name: 'Appointments', subtitle: 'Book & Manage', icon: 'calendar', bg: COLORS.GOLD_LIGHT, iconColor: COLORS.GOLD, phase: 'Phase 2', keywords: ['schedule', 'booking'] },
  { key: 'advisories', name: 'Advisories', subtitle: 'Announcements', icon: 'megaphone', bg: COLORS.PURPLE_LIGHT, iconColor: COLORS.PURPLE, phase: 'Phase 2', keywords: ['notice', 'announcement'] },
];

export const EXPLORE_CATEGORIES: ExploreCategory[] = [
  { key: 'civil-registry', name: 'Civil Registry', subtitle: 'Birth, Marriage, Death Certificates & more', icon: 'people', iconColor: COLORS.BLUE, tint: COLORS.BLUE_LIGHT, phase: 'Phase 2', featured: true, keywords: ['birth', 'marriage', 'death', 'certificate'] },
  { key: 'local-government', name: 'Local Government', subtitle: 'Clearances & certificates', icon: 'business', iconColor: COLORS.SUCCESS, tint: COLORS.SUCCESS_LIGHT, phase: 'Phase 2', keywords: ['lgu', 'clearance'] },
  { key: 'social-services', name: 'Social Services', subtitle: 'Assistance & benefits', icon: 'heart', iconColor: COLORS.PRIMARY, tint: COLORS.PRIMARY_LIGHT, phase: 'Phase 3', keywords: ['aid', 'assistance', 'benefits'] },
  { key: 'environment', name: 'Environment', subtitle: 'Sanitation & Waste Management', icon: 'leaf', iconColor: COLORS.SUCCESS, tint: COLORS.SUCCESS_LIGHT, phase: 'Phase 3', keywords: ['waste', 'sanitation', 'environment'] },
  { key: 'engineering', name: 'Engineering', subtitle: 'Construction permits & inspections', icon: 'construct', iconColor: COLORS.GOLD, tint: COLORS.GOLD_LIGHT, phase: 'Phase 3', keywords: ['construction', 'permit', 'inspection'] },
  { key: 'health-services', name: 'Health Services', subtitle: 'Health programs, appointments & more', icon: 'medkit', iconColor: COLORS.PRIMARY, tint: COLORS.PRIMARY_LIGHT, phase: 'Phase 2', featured: true, keywords: ['health', 'medical', 'clinic'] },
  { key: 'education', name: 'Education', subtitle: 'Scholarships & schools', icon: 'school', iconColor: COLORS.PURPLE, tint: COLORS.PURPLE_LIGHT, phase: 'Phase 3', keywords: ['scholarship', 'school', 'students'] },
  { key: 'public-safety', name: 'Public Safety', subtitle: 'Security & disaster preparedness', icon: 'shield-checkmark', iconColor: COLORS.BLUE, tint: COLORS.BLUE_LIGHT, phase: 'Phase 2', keywords: ['safety', 'disaster', 'police'] },
  { key: 'tourism-culture', name: 'Tourism & Culture', subtitle: 'Events, Attractions & Local Tourism', icon: 'compass', iconColor: COLORS.ORANGE, tint: COLORS.ORANGE_LIGHT, phase: 'Phase 3', featured: true, keywords: ['tourism', 'events', 'culture'] },
];

export const QUICK_LINKS: QuickLink[] = [
  { key: 'pay-fees', label: 'Pay Fees', icon: 'wallet', iconBg: COLORS.BLUE_LIGHT, iconColor: COLORS.BLUE, phase: 'Phase 2', keywords: ['payment', 'bills', 'pay'] },
  { key: 'report', label: 'Report', icon: 'flag', iconBg: COLORS.ORANGE_LIGHT, iconColor: COLORS.ORANGE, phase: 'Phase 2', keywords: ['complaint', 'issue'] },
  { key: 'feedback', label: 'Feedback', icon: 'chatbubble-ellipses', iconBg: COLORS.SUCCESS_LIGHT, iconColor: COLORS.SUCCESS, phase: 'Phase 2', keywords: ['feedback', 'suggestion'] },
  { key: 'faqs', label: 'FAQs', icon: 'help-circle', iconBg: COLORS.PURPLE_LIGHT, iconColor: COLORS.PURPLE, phase: 'Phase 2', keywords: ['help', 'questions'] },
];

// ─── Search ──────────────────────────────────────────────

type Searchable = { name?: string; label?: string; keywords?: string[] };

function matchesQuery(item: Searchable, q: string): boolean {
  const haystack = [item.name, item.label, ...(item.keywords ?? [])]
    .filter((s): s is string => !!s)
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

export interface FilteredServices {
  quickActions: QuickAction[];
  exploreCategories: ExploreCategory[];
  quickLinks: QuickLink[];
}

export function filterAllServices(query: string): FilteredServices {
  const q = query.trim().toLowerCase();
  if (!q) {
    return {
      quickActions: QUICK_ACTIONS,
      exploreCategories: EXPLORE_CATEGORIES,
      quickLinks: QUICK_LINKS,
    };
  }
  return {
    quickActions: QUICK_ACTIONS.filter((i) => matchesQuery(i, q)),
    exploreCategories: EXPLORE_CATEGORIES.filter((i) => matchesQuery(i, q)),
    quickLinks: QUICK_LINKS.filter((i) => matchesQuery(i, q)),
  };
}
