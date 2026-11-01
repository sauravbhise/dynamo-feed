import { z } from "zod";
import profileJson from "./profile.json";
import castJson from "./cast.json";
import reelsJson from "./reels.json";
import nowJson from "./now.json";
import {
  castMemberSchema,
  nowSchema,
  profileSchema,
  reelSchema,
  templateDataSchemas,
  templateSchema,
} from "./schemas";
import type {
  Beat,
  CastMember,
  Now,
  Profile,
  ProfileItemRef,
  ProfileSectionKey,
  Reel,
  ReelTemplate,
} from "./types";

// ZodType's third parameter (input) is decoupled so `.default()` fields don't
// make the parsed output's type optional.
function parse<T>(schema: z.ZodType<T, z.ZodTypeDef, unknown>, data: unknown, file: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[content] ${file} failed validation`, result.error.flatten());
    throw new Error(`Invalid content file: ${file}`);
  }
  return result.data;
}

export const profile: Profile = parse(profileSchema, profileJson, "profile.json");
export const cast: CastMember[] = parse(z.array(castMemberSchema), castJson, "cast.json");
export const reels: Reel[] = parse(z.array(reelSchema), reelsJson, "reels.json");
export const now: Now = parse(nowSchema, nowJson, "now.json");

// Validate each beat's template extras so a wrong field fails at load time.
reels.forEach((reel) => {
  const schema = templateDataSchemas[reel.template as ReelTemplate];
  if (!schema) return;
  reel.beats.forEach((beat, i) => {
    if (beat.data === undefined) return;
    const result = schema.safeParse(beat.data);
    if (!result.success) {
      throw new Error(
        `[content] ${reel.id} beat ${i}: invalid ${reel.template} data — ${result.error.message}`
      );
    }
  });
});

export const castById: Record<string, CastMember> = Object.fromEntries(
  cast.map((member) => [member.id, member])
);

export const castColor = (id: string): string => castById[id]?.color ?? "#B9ADA6";

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
      return { section: "experience", itemId: `experience-${i}`, title: profile.experience[i].title };
    }
  }
  for (let i = 0; i < profile.projects.length; i++) {
    if (profile.projects[i].reelSlug === slug) {
      return { section: "projects", itemId: `projects-${i}`, title: profile.projects[i].name };
    }
  }
  for (let i = 0; i < profile.community.length; i++) {
    if (profile.community[i].reelSlug === slug) {
      return { section: "community", itemId: `community-${i}`, title: profile.community[i].title };
    }
  }
  return null;
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
