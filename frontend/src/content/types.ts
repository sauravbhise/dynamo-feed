export type ReelTemplate =
  | "review"
  | "breaking_news"
  | "documentary"
  | "storytime"
  | "myth_vs_fact"
  | "stat_reveal";

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
  audioSrc?: string;
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
  likes: number;
  beats: Beat[];
  comments: ReelComment[];
}

export interface CastMember {
  id: string;
  name: string;
  role: string;
  color: string;
  scale: number;
  framing: "full" | "waist";
}

export interface StoryItem {
  caption: string;
  image?: string;
}

export interface Story {
  id: string;
  title: string;
  items: StoryItem[];
}

export interface StatItem {
  label: string;
  value: string;
}

export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  note: string;
}

export interface ProjectItem {
  name: string;
  description: string;
  tag?: string;
}

export interface EducationItem {
  title: string;
  org: string;
  period: string;
}

export interface CertificationItem {
  title: string;
  issuer: string;
  year: string;
}

export interface LinkItem {
  label: string;
  url: string;
}

export interface Profile {
  name: string;
  oneLiner: string;
  photo: string;
  resumeUrl: string;
  stories: Story[];
  stats: StatItem[];
  now: { reading: string; watching: string };
  highlights: string[];
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  links: LinkItem[];
}

export interface Reading {
  cover: string;
  title: string;
  author: string;
  progress: number;
  take: string;
}

export interface WatchingItem {
  title: string;
  kind?: string;
  note: string;
  image?: string;
}

export interface WritingLink {
  platform: "substack" | "dev" | "medium" | "blog";
  title: string;
  url: string;
}

export interface LifeItem {
  id: string;
  label: string;
  detail?: string;
  streak?: number;
}

export interface Now {
  updated: string;
  reading: Reading;
  watching: WatchingItem[];
  writing: WritingLink[];
  life: LifeItem[];
}

export interface ReviewData {
  stars?: number;
  verdict?: string;
}

export interface BreakingNewsData {
  headline?: string;
  ticker?: string;
}

export interface DocumentaryData {
  title?: string;
}

export interface MythVsFactData {
  myth?: string;
  fact?: string;
}

export interface StatRevealData {
  value?: number;
  unit?: string;
  label?: string;
  before?: string;
  after?: string;
}
