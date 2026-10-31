import { z } from "zod";
import profileJson from "./profile.json";
import castJson from "./cast.json";
import reelsJson from "./reels.json";
import askJson from "./ask.json";
import {
  askSchema,
  castMemberSchema,
  profileSchema,
  reelSchema,
} from "./schemas";
import type { AskEntry, CastMember, Profile, Reel } from "./types";

function parse<T>(schema: z.ZodType<T>, data: unknown, file: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[content] ${file} failed validation`, result.error.flatten());
    throw new Error(`Invalid content file: ${file}`);
  }
  return result.data;
}

export const profile: Profile = parse(profileSchema, profileJson, "profile.json");
export const cast: CastMember[] = parse(
  z.array(castMemberSchema),
  castJson,
  "cast.json"
);
export const reels: Reel[] = parse(z.array(reelSchema), reelsJson, "reels.json");
export const ask: AskEntry[] = parse(askSchema, askJson, "ask.json");

export const SELF_COLOR = "#B026FF";

export const castById: Record<string, CastMember> = Object.fromEntries(
  cast.map((member) => [member.id, member])
);

export const castColor = (id: string): string =>
  id === "visitor" || id === "self" ? SELF_COLOR : castById[id]?.color ?? "#8E8CA0";
