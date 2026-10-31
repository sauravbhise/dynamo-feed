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
  personality: string;
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

export interface AskEntry {
  id: string;
  question: string;
  answer: string;
}
