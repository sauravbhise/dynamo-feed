import { z } from "zod";

export const templateSchema = z.enum([
  "review",
  "breaking_news",
  "documentary",
  "storytime",
  "myth_vs_fact",
  "stat_reveal",
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
  audioSrc: z.string().optional(),
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
});

export const castMemberSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "must be a hex colour"),
  scale: z.number().positive(),
  framing: z.enum(["full", "waist"]),
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
  stats: z.array(z.object({ value: z.string(), label: z.string().min(1) })),
  experience: z.array(
    z.object({
      title: z.string().min(1),
      org: z.string(),
      dates: z.string(),
      text: z.string(),
      reelSlug: z.string().optional(),
    })
  ),
  projects: z.array(
    z.object({
      name: z.string().min(1),
      text: z.string(),
      tags: z.array(z.string()),
      links: z.array(z.object({ label: z.string(), url: z.string() })),
      reelSlug: z.string().optional(),
    })
  ),
  writing: z.array(
    z.object({
      title: z.string().min(1),
      venue: z.string(),
      role: z.string(),
      year: z.string(),
      url: z.string(),
    })
  ),
  community: z.array(
    z.object({
      title: z.string().min(1),
      org: z.string(),
      dates: z.string(),
      text: z.string(),
      reelSlug: z.string().optional(),
    })
  ),
  education: z.array(
    z.object({
      title: z.string().min(1),
      org: z.string(),
      dates: z.string(),
      text: z.string(),
    })
  ),
  certifications: z.array(
    z.object({ name: z.string().min(1), issuer: z.string() })
  ),
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
