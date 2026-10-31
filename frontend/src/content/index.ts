import { z } from "zod";
import profileJson from "./profile.json";
import castJson from "./cast.json";
import reelsJson from "./reels.json";
import nowJson from "./now.json";
import { castMemberSchema, nowSchema, profileSchema, reelSchema } from "./schemas";
import type { CastMember, Now, Profile, Reel } from "./types";

function parse<T>(schema: z.ZodType<T>, data: unknown, file: string): T {
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

export const SELF_COLOR = "#A9BED6";

export const castById: Record<string, CastMember> = Object.fromEntries(
  cast.map((member) => [member.id, member])
);

export const castColor = (id: string): string => castById[id]?.color ?? "#B9ADA6";

export function timeAgo(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (hours < 48) return "yesterday";
  return `${Math.floor(hours / 24)} days ago`;
}
