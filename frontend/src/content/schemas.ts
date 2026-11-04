import { z } from "zod";

export const templateSchema = z.enum([
  "review",
  "breaking_news",
  "documentary",
  "storytime",
  "myth_vs_fact",
  "stat_reveal",
  "interview",
  "tier_list",
  "stitch",
  "pov",
  "day_in_life",
  "nudge",
]);

export const poseSchema = z.enum([
  "neutral",
  "talking",
  "pointing",
  "shocked",
  "laughing",
  "sceptical",
  "celebrating",
  "thinking",
]);

export const beatSchema = z.object({
  characterId: z.string().min(1),
  pose: poseSchema,
  caption: z.string().min(1),
  durationMs: z.number().positive(),
  data: z.record(z.unknown()).optional(),
});

export const reelSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  template: templateSchema,
  hostId: z.string().min(1),
  seriesId: z.string().optional(),
  part: z.number().int().positive().optional(),
  likes: z.number().int().nonnegative(),
  beats: z.array(beatSchema).min(1),
  comments: z.array(z.object({ authorId: z.string(), text: z.string().min(1) })),
  /** Optional per-reel background: a public/ path or a full URL. */
  background: z.string().optional(),
  auto: z.boolean().optional(),
});

export const castMemberSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "must be a hex colour"),
  scale: z.number().positive(),
  headroom: z.number().min(0).max(1),
  framing: z.enum(["full", "waist"]),
  // TTS voice for the character, filled by scripts/generate-voices.mjs users.
  voiceId: z.string().optional(),
});

// Per-template beat data — a wrong field fails at load time.
export const templateDataSchemas: Partial<Record<z.infer<typeof templateSchema>, z.ZodTypeAny>> = {
  review: z
    .object({ stars: z.number().min(0).max(5), verdict: z.string() })
    .partial()
    .strict(),
  breaking_news: z
    .object({ headline: z.string(), ticker: z.string() })
    .partial()
    .strict(),
  documentary: z.object({ title: z.string() }).partial().strict(),
  myth_vs_fact: z.object({ myth: z.string(), fact: z.string() }).partial().strict(),
  stat_reveal: z
    .object({
      value: z.number(),
      unit: z.string(),
      label: z.string(),
      before: z.string(),
      after: z.string(),
    })
    .partial()
    .strict(),
  // storytime and nudge keep no template extras
  storytime: z.object({}).passthrough(),
  interview: z.object({ guest: z.string(), topic: z.string() }).partial().strict(),
  tier_list: z
    .object({
      title: z.string(),
      tiers: z.array(z.string()),
      item: z.object({ label: z.string(), tier: z.string() }),
    })
    .partial()
    .strict(),
  stitch: z.object({ stitchSlug: z.string() }).partial().strict(),
  pov: z.object({ pov: z.string() }).partial().strict(),
};

export const profileSchema = z.object({
  name: z.string().min(1),
  oneLiner: z.string().min(1),
  photo: z.string(),
  location: z.string(),
  email: z.string().min(1),
  resumeUrl: z.string().min(1),
  socials: z.array(
    z.object({ platform: z.string().min(1), url: z.string().min(1) })
  ),
  skills: z.array(z.string()).default([]),
  highlights: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        reelSlugs: z.array(z.string().min(1)).min(1),
        cover: z.string().optional(),
      })
    )
    .default([]),
  experience: z.array(
    z.object({
      title: z.string().min(1),
      org: z.string(),
      dates: z.string(),
      text: z.string(),
      reelSlug: z.string().optional(),
      pageSlug: z.string().optional(),
    })
  ),
  projects: z.array(
    z.object({
      name: z.string().min(1),
      text: z.string(),
      tags: z.array(z.string()),
      links: z.array(z.object({ label: z.string(), url: z.string() })),
      reelSlug: z.string().optional(),
      pageSlug: z.string().optional(),
    })
  ),
  writing: z.array(
    z.object({
      title: z.string().min(1),
      venue: z.string(),
      role: z.string(),
      year: z.string(),
      url: z.string(),
      pageSlug: z.string().optional(),
    })
  ),
  community: z.array(
    z.object({
      title: z.string().min(1),
      org: z.string(),
      dates: z.string(),
      text: z.string(),
      reelSlug: z.string().optional(),
      pageSlug: z.string().optional(),
    })
  ),
  education: z.array(
    z.object({
      title: z.string().min(1),
      org: z.string(),
      dates: z.string(),
      text: z.string(),
      pageSlug: z.string().optional(),
    })
  ),
  certifications: z.array(
    z.object({ name: z.string().min(1), issuer: z.string(), pageSlug: z.string().optional() })
  ),
});

// ---------- Pages (pages.json) ----------
export const pageStatSchema = z.object({
  value: z.string(),
  label: z.string().min(1),
});

export const pageBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("heading"), text: z.string().min(1) }),
  z.object({ type: z.literal("text"), text: z.string().min(1) }),
  z.object({
    type: z.literal("image"),
    src: z.string().min(1),
    alt: z.string().min(1),
    caption: z.string().optional(),
  }),
  z.object({ type: z.literal("stats"), items: z.array(pageStatSchema).min(2).max(4) }),
  z.object({
    type: z.literal("chips"),
    label: z.string().optional(),
    items: z.array(z.string().min(1)).min(1),
  }),
  z.object({
    type: z.literal("links"),
    items: z.array(z.object({ label: z.string().min(1), url: z.string().min(1) })).min(1),
  }),
  z.object({ type: z.literal("quote"), text: z.string().min(1), by: z.string().optional() }),
  z.object({ type: z.literal("divider") }),
]);

export const pageSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "must be a url-safe slug"),
  kicker: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  dates: z.string().optional(),
  reelSlug: z.string().optional(),
  blocks: z.array(pageBlockSchema),
});

export const nowSchema = z.object({
  updatedAt: z.string().min(1),
  reading: z.object({
    title: z.string().min(1),
    author: z.string().min(1),
    cover: z.string(),
    progress: z.number().min(0).max(100),
    take: z.string(),
  }),
  watch: z.array(
    z.object({
      title: z.string().min(1),
      kind: z.string(),
      year: z.number().int(),
      why: z.string(),
    })
  ),
  writing: z.array(
    z.object({
      platform: z.enum(["substack", "dev", "medium", "blog"]),
      title: z.string().min(1),
      url: z.string().min(1),
    })
  ),
  volunteering: z.object({
    status: z.string(),
    text: z.string(),
  }),
  spanish: z.object({
    streak: z.number().int().nonnegative(),
  }),
});
