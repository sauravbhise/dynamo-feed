import { z } from "zod";

export const templateSchema = z.enum([
  "review",
  "breaking_news",
  "documentary",
  "storytime",
  "myth_vs_fact",
  "stat_reveal",
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
  personality: z.string().min(1),
});

export const profileSchema = z.object({
  name: z.string().min(1),
  oneLiner: z.string().min(1),
  photo: z.string(),
  resumeUrl: z.string(),
  stories: z.array(
    z.object({
      id: z.string().min(1),
      title: z.string().min(1),
      items: z.array(
        z.object({
          caption: z.string().min(1),
          image: z.string().optional(),
        })
      ),
    })
  ),
  stats: z.array(z.object({ label: z.string().min(1), value: z.string() })),
  now: z.object({ reading: z.string(), watching: z.string() }),
  highlights: z.array(z.string()),
  experience: z.array(
    z.object({
      role: z.string().min(1),
      company: z.string().min(1),
      period: z.string(),
      note: z.string(),
    })
  ),
  projects: z.array(
    z.object({
      name: z.string().min(1),
      description: z.string(),
      tag: z.string().optional(),
    })
  ),
  education: z.array(
    z.object({ title: z.string().min(1), org: z.string(), period: z.string() })
  ),
  certifications: z.array(
    z.object({ title: z.string().min(1), issuer: z.string(), year: z.string() })
  ),
  links: z.array(z.object({ label: z.string().min(1), url: z.string() })),
});

export const nowSchema = z.object({
  updated: z.string().min(1),
  reading: z.object({
    cover: z.string(),
    title: z.string().min(1),
    author: z.string().min(1),
    progress: z.number().min(0).max(1),
    take: z.string(),
  }),
  watching: z.array(
    z.object({
      title: z.string().min(1),
      kind: z.string().optional(),
      note: z.string(),
      image: z.string().optional(),
    })
  ),
  writing: z.array(
    z.object({
      platform: z.enum(["substack", "dev", "medium", "blog"]),
      title: z.string().min(1),
      url: z.string().min(1),
    })
  ),
  life: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      detail: z.string().optional(),
      streak: z.number().int().nonnegative().optional(),
    })
  ),
});
