import { z } from "zod";
import profileJson from "./profile.json";
import pagesJson from "./pages.json";
import castJson from "./cast.json";
import reelsJson from "./reels.json";
import nowJson from "./now.json";
import {
  castMemberSchema,
  nowSchema,
  pageSchema,
  profileSchema,
  reelSchema,
  templateDataSchemas,
  templateSchema,
} from "./schemas";
import type {
  Beat,
  CastMember,
  Now,
  Page,
  Profile,
  ProfileItemRef,
  ProfileSectionKey,
  Reel,
  ReelTemplate,
} from "./types";
import type { Highlight } from "./types";

// ---------- Validation that never blanks the site ----------
// Each file is validated separately; a failure logs a clear warning naming
// the file and the offending fields, and that file degrades gracefully.

// ZodType's third parameter (input) is decoupled so `.default()` fields don't
// make the parsed output's type optional.
function safeParse<T>(
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  data: unknown,
  file: string
): T | null {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.warn(
      `[content] ${file} is invalid — continuing without it. Fields:`,
      result.error.flatten().fieldErrors
    );
    return null;
  }
  return result.data;
}

// Draft fields (empty, or containing "REPLACE") never render anywhere —
// the same rule the auto-reel generator uses.
export function contentUsable(value: unknown): boolean {
  return (
    value !== undefined &&
    value !== null &&
    !(typeof value === "string" && value.trim() === "") &&
    !(typeof value === "string" && /replace/i.test(value))
  );
}

// ---------- profile.json — a minimal header with the name only ----------
function fallbackProfile(): Profile {
  const rawName = (profileJson as { name?: unknown } | undefined)?.name;
  const name = contentUsable(rawName) ? String(rawName) : "Saurav Bhise";
  return {
    name,
    oneLiner: "",
    photo: "/avatar.svg",
    location: "",
    email: "",
    resumeUrl: "",
    socials: [],
    skills: [],
    experience: [],
    projects: [],
    writing: [],
    community: [],
    education: [],
    certifications: [],
  };
}

const parsedProfile = safeParse(profileSchema, profileJson, "profile.json");
export const profileValid = parsedProfile !== null;
export const profile: Profile = parsedProfile ?? fallbackProfile();

// ---------- cast.json — an empty cast (characters just don't render) ----------
export const cast: CastMember[] =
  safeParse(z.array(castMemberSchema), castJson, "cast.json") ?? [];

// ---------- reels.json — skip the invalid reels, keep the rest ----------
function parseReels(data: unknown): Reel[] {
  if (!Array.isArray(data)) {
    console.warn("[content] reels.json is invalid — no reels loaded (not an array).");
    return [];
  }
  const out: Reel[] = [];
  data.forEach((entry, index) => {
    const result = reelSchema.safeParse(entry);
    if (!result.success) {
      console.warn(
        `[content] reels.json: reel ${index} (${
          (entry as { id?: string } | undefined)?.id ?? "unknown"
        }) is invalid — skipping it. Fields:`,
        result.error.flatten().fieldErrors
      );
      return;
    }
    const reel = result.data as Reel;
    // A reel whose template extras are wrong would render broken — skip it too.
    const dataSchema = templateDataSchemas[reel.template as ReelTemplate];
    let dataOk = true;
    if (dataSchema) {
      for (let i = 0; i < reel.beats.length && dataOk; i++) {
        if (reel.beats[i].data === undefined) continue;
        if (!dataSchema.safeParse(reel.beats[i].data).success) {
          console.warn(
            `[content] reels.json: reel ${reel.id} beat ${i} has invalid ${reel.template} data — skipping the reel.`
          );
          dataOk = false;
        }
      }
    }
    if (dataOk) out.push(reel);
  });
  return out;
}

export const reels: Reel[] = parseReels(reelsJson);

// ---------- pages.json — invalid pages (or blocks) are skipped ----------
function parsePages(data: unknown): Page[] {
  if (!Array.isArray(data)) {
    console.warn("[content] pages.json is invalid — no pages loaded (not an array).");
    return [];
  }
  const out: Page[] = [];
  const seen = new Set<string>();
  data.forEach((entry, index) => {
    const result = pageSchema.safeParse(entry);
    if (!result.success) {
      console.warn(
        `[content] pages.json: page ${index} (${
          (entry as { slug?: string } | undefined)?.slug ?? "unknown"
        }) is invalid — skipping it. Fields:`,
        result.error.flatten().fieldErrors
      );
      return;
    }
    const page = result.data as Page;
    if (seen.has(page.slug)) {
      console.warn(`[content] pages.json: duplicate slug "${page.slug}" — skipping the later page.`);
      return;
    }
    seen.add(page.slug);
    out.push(page);
  });
  return out;
}

export const pages: Page[] = parsePages(pagesJson);

export const pageBySlug = (slug: string): Page | undefined => pages.find((page) => page.slug === slug);

// A pageSlug in profile.json pointing at no page hides its "Read more"
// button — warned about once per slug.
const warnedPageSlugs = new Set<string>();
export function warnUnknownPageSlug(slug: string): void {
  if (warnedPageSlugs.has(slug)) return;
  warnedPageSlugs.add(slug);
  console.warn(`[content] pageSlug "${slug}" matches no page in pages.json — "Read more" hidden.`);
}

// ---------- now.json — null hides the right column and its auto reels ----------
export const now: Now | null = safeParse(nowSchema, nowJson, "now.json");

export const castById: Record<string, CastMember> = Object.fromEntries(
  cast.map((member) => [member.id, member])
);

export const castColor = (id: string): string => castById[id]?.color ?? "#B9ADA6";

// Story highlights: unknown reel slugs are dropped (with a warning); a
// highlight left without any valid reels is hidden entirely.
export const highlights: Highlight[] = (profile.highlights ?? [])
  .map((highlight) => {
    const validSlugs = highlight.reelSlugs.filter((slug) => {
      if (reels.some((reel) => reel.slug === slug)) return true;
      console.warn(`[content] profile.json: highlight "${highlight.id}" skips unknown reel slug "${slug}".`);
      return false;
    });
    return { ...highlight, reelSlugs: validSlugs };
  })
  .filter((highlight) => highlight.reelSlugs.length > 0);

// "Part X of Y" from every reel sharing the seriesId.
export function seriesInfo(reel: Reel): { part: number; total: number } | null {
  if (!reel.seriesId) return null;
  const parts = reels
    .filter((r) => r.seriesId === reel.seriesId)
    .sort((a, b) => (a.part ?? 0) - (b.part ?? 0));
  return { part: reel.part ?? parts.findIndex((r) => r.id === reel.id) + 1, total: parts.length };
}

// Reading time: the caption drives the beat length (1200ms + 55ms per
// character, clamped to 2.5–7s); storytime adds a 700ms typing lead-in.
// Hand-tuned durationMs only wins when it is longer than the computed time.
export function beatDurationMs(beat: Beat, template: ReelTemplate): number {
  const computed = Math.min(Math.max(1200 + 55 * beat.caption.length, 2500), 7000);
  const withTyping = template === "storytime" ? computed + 700 : computed;
  return Math.max(withTyping, beat.durationMs);
}

// Which portfolio item does this reel's slug belong to? Ids match the
// data-item-id attributes rendered in LeftColumn.
export function profileItemBySlug(slug: string): ProfileItemRef | null {
  for (let i = 0; i < profile.experience.length; i++) {
    if (profile.experience[i].reelSlug === slug) {
      return { section: "experience", itemId: `experience-${i}`, title: profile.experience[i].title, pageSlug: profile.experience[i].pageSlug };
    }
  }
  for (let i = 0; i < profile.projects.length; i++) {
    if (profile.projects[i].reelSlug === slug) {
      return { section: "projects", itemId: `projects-${i}`, title: profile.projects[i].name, pageSlug: profile.projects[i].pageSlug };
    }
  }
  for (let i = 0; i < profile.community.length; i++) {
    if (profile.community[i].reelSlug === slug) {
      return { section: "community", itemId: `community-${i}`, title: profile.community[i].title, pageSlug: profile.community[i].pageSlug };
    }
  }
  return null;
}

// Whole days from a date until now; 0 for a future or unparseable date.
export function wholeDaysSince(iso: string): number {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  return Number.isFinite(days) ? Math.max(days, 0) : 0;
}

export function timeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (hours < 48) return "yesterday";
  return `${Math.floor(hours / 24)} days ago`;
}

export type { ProfileSectionKey };
