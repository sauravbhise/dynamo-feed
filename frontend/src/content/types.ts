export type ReelTemplate =
  | "review"
  | "breaking_news"
  | "documentary"
  | "storytime"
  | "myth_vs_fact"
  | "stat_reveal"
  | "interview"
  | "tier_list"
  | "stitch"
  | "pov"
  | "day_in_life"
  | "nudge";

export type Pose =
  | "neutral"
  | "talking"
  | "pointing"
  | "shocked"
  | "laughing"
  | "sceptical"
  | "celebrating"
  | "thinking";

export interface Beat {
  characterId: string;
  pose: Pose;
  caption: string;
  durationMs: number;
  data?: Record<string, unknown>;
}

export interface ReelComment {
  authorId: string;
  text: string;
}

export interface Reel {
  id: string;
  slug: string;
  template: ReelTemplate;
  hostId: string;
  seriesId?: string;
  part?: number;
  /** Optional background image (public/ path or full URL) — beats the template default. */
  background?: string;
  likes: number;
  beats: Beat[];
  comments: ReelComment[];
  /** True for reels generated at runtime from now.json. */
  auto?: boolean;
}

export interface CastMember {
  id: string;
  name: string;
  role: string;
  color: string;
  scale: number;
  /** Fraction of the sprite frame's height that is empty space above the character. */
  headroom: number;
  framing: "full" | "waist";
}

// ---------- Portfolio (profile.json) ----------

export interface SocialLink {
  platform: string;
  url: string;
}

export interface ExperienceEntry {
  title: string;
  org: string;
  dates: string;
  text: string;
  reelSlug?: string;
  pageSlug?: string;
}

export interface ProjectEntry {
  name: string;
  text: string;
  tags: string[];
  links: { label: string; url: string }[];
  reelSlug?: string;
  pageSlug?: string;
}

export interface WritingEntry {
  title: string;
  venue: string;
  role: string;
  year: string;
  url: string;
  pageSlug?: string;
}

export interface CommunityEntry {
  title: string;
  org: string;
  dates: string;
  text: string;
  reelSlug?: string;
  pageSlug?: string;
}

export interface EducationEntry {
  title: string;
  org: string;
  dates: string;
  text: string;
  pageSlug?: string;
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  pageSlug?: string;
}

export interface Highlight {
  id: string;
  label: string;
  reelSlugs: string[];
  cover?: string;
}

export interface Profile {
  name: string;
  oneLiner: string;
  photo: string;
  location: string;
  email: string;
  resumeUrl: string;
  socials: SocialLink[];
  skills: string[];
  highlights?: Highlight[];
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  writing: WritingEntry[];
  community: CommunityEntry[];
  education: EducationEntry[];
  certifications: CertificationEntry[];
}

// ---------- "Off the clock" (now.json) ----------

export interface Reading {
  title: string;
  author: string;
  cover: string;
  /** 0–100 percent through the book. */
  progress: number;
  take: string;
}

export interface WatchItem {
  title: string;
  kind: string;
  year: number;
  why: string;
}

export interface WritingLink {
  platform: "substack" | "dev" | "medium" | "blog";
  title: string;
  url: string;
}

export interface Now {
  updatedAt: string;
  reading: Reading;
  watch: WatchItem[];
  writing: WritingLink[];
  volunteering: { status: string; text: string };
  spanish: { streak: number };
}

// ---------- Reel ↔ portfolio item link ----------

export type ProfileSectionKey =
  | "experience"
  | "projects"
  | "writing"
  | "community"
  | "education";

export interface ProfileItemRef {
  section: ProfileSectionKey;
  itemId: string;
  title: string;
}

// ---------- Pages (pages.json) ----------

export type PageBlock =
  | { type: "heading"; text: string }
  | { type: "text"; text: string }
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "stats"; items: { value: string; label: string }[] }
  | { type: "chips"; label?: string; items: string[] }
  | { type: "links"; items: { label: string; url: string }[] }
  | { type: "quote"; text: string; by?: string }
  | { type: "divider" };

export interface Page {
  /** Unique, url-safe — the page lives at /p/<slug>. */
  slug: string;
  /** Small label above the title, e.g. "Project". */
  kicker?: string;
  title: string;
  subtitle?: string;
  dates?: string;
  /** Jumps the feed to this reel from the page. */
  reelSlug?: string;
  blocks: PageBlock[];
}
