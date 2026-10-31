import { motion } from "framer-motion";
import { BadgeCheck, BookOpen, Clapperboard, Download, ExternalLink } from "lucide-react";
import { cast, profile, SELF_COLOR } from "../content";
import { Logo } from "./Logo";

const rise = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.55, ease: "easeOut" },
};

const lineReveal = {
  hidden: { y: "115%" },
  show: (i: number) => ({
    y: 0,
    transition: { delay: 0.3 + i * 0.14, duration: 0.75, ease: "easeOut" },
  }),
};

const MARQUEE_ITEMS = [
  "Cartoon reels about me",
  "Neo-brutalist by choice",
  "Layout first — motion later",
  "Built with React + Vite",
];

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="flex items-center gap-2 font-display text-[11px] uppercase tracking-[0.24em] text-muted">
      <span className="size-2 bg-accent" aria-hidden="true" />
      {children}
    </h2>
  );
}

function StoryRing({ title, color }: { title: string; color: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-1.5" data-testid="story-ring">
      <span className="grid size-14 place-items-center rounded-full p-[3px]" style={{ backgroundColor: color }}>
        <span className="grid size-full place-items-center rounded-full bg-raised font-display text-[11px] uppercase text-line">
          {title.slice(0, 2)}
        </span>
      </span>
      <span className="max-w-16 truncate text-[10px] font-bold uppercase tracking-wide text-muted">{title}</span>
    </div>
  );
}

function Marquee() {
  return (
    <div className="-mx-5 overflow-hidden border-y-[3px] border-line bg-raised py-2" data-testid="marquee">
      <div className="animate-marquee flex w-max">
        {[0, 1].map((copy) => (
          <div key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
            {MARQUEE_ITEMS.map((item) => (
              <span
                key={item}
                className="flex items-center gap-2 pr-8 text-[11px] font-extrabold uppercase tracking-[0.22em] text-muted"
              >
                <span className="size-1.5 bg-accent" aria-hidden="true" />
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeftColumn() {
  const rings = [
    { title: "Me", color: SELF_COLOR },
    ...profile.stories.map((story, i) => ({ title: story.title, color: cast[i]?.color ?? SELF_COLOR })),
  ];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8 p-5"
      data-testid="left-column-content"
    >
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Logo />
          <span className="rounded-full border-2 border-line px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-muted">
            Ep. 0 · Shell
          </span>
        </div>
        <h1 className="font-display text-[44px] uppercase leading-[0.92]" data-testid="wordmark">
          <span className="block overflow-hidden pb-0.5">
            <motion.span className="block" variants={lineReveal} custom={0}>
              Dynamo
            </motion.span>
          </span>
          <span className="block overflow-hidden pb-1">
            <motion.span className="block text-accent" variants={lineReveal} custom={1}>
              Feed<span className="text-line">.</span>
            </motion.span>
          </span>
        </h1>
        <p className="text-sm leading-relaxed text-muted">{profile.oneLiner}</p>
      </header>

      <Marquee />

      <motion.section {...rise} className="flex items-center gap-4 rounded-2xl border-[3px] border-line bg-raised p-4 shadow-brut" data-testid="profile-card">
        <img
          src={profile.photo}
          alt={profile.name}
          data-testid="profile-photo"
          className="size-20 shrink-0 rounded-xl border-[3px] border-line object-cover"
        />
        <div className="min-w-0">
          <p className="font-display text-lg uppercase leading-tight">{profile.name}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">{profile.oneLiner}</p>
        </div>
      </motion.section>

      <motion.section {...rise} data-testid="story-rings">
        <SectionTitle>Stories</SectionTitle>
        <div className="scrollbar-brut mt-3 flex gap-4 overflow-x-auto pb-1">
          {rings.map((ring) => (
            <StoryRing key={ring.title} {...ring} />
          ))}
        </div>
      </motion.section>

      <motion.section {...rise} data-testid="stats-strip">
        <SectionTitle>Stats</SectionTitle>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {profile.stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border-[3px] border-line bg-surface p-3 shadow-brut-xs">
              <p className="font-display text-xl">{stat.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section {...rise} data-testid="now-section">
        <SectionTitle>Now</SectionTitle>
        <div className="mt-3 flex flex-col gap-3 rounded-2xl border-[3px] border-line bg-raised p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg border-2 border-line bg-surface">
              <BookOpen className="size-4 text-accent" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Reading</p>
              <p className="truncate text-sm font-semibold">{profile.now.reading}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg border-2 border-line bg-surface">
              <Clapperboard className="size-4 text-accent" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Watching</p>
              <p className="truncate text-sm font-semibold">{profile.now.watching}</p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section {...rise} data-testid="highlights">
        <SectionTitle>Highlights</SectionTitle>
        <div className="mt-3 flex flex-wrap gap-2">
          {profile.highlights.map((highlight) => (
            <span key={highlight} className="rounded-full border-2 border-line bg-surface px-3 py-1 text-xs font-bold">
              {highlight}
            </span>
          ))}
        </div>
      </motion.section>

      <motion.section {...rise} data-testid="experience">
        <SectionTitle>Experience</SectionTitle>
        <div className="mt-3 flex flex-col gap-3">
          {profile.experience.map((job) => (
            <div key={job.role} className="rounded-2xl border-[3px] border-line bg-surface p-4 shadow-brut-xs">
              <span className="rounded-full border-2 border-line px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-muted">
                {job.period}
              </span>
              <p className="mt-2 text-sm font-bold">{job.role}</p>
              <p className="text-xs font-extrabold uppercase tracking-wide text-accent">{job.company}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{job.note}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section {...rise} data-testid="projects">
        <SectionTitle>Projects</SectionTitle>
        <div className="mt-3 flex flex-col gap-3">
          {profile.projects.map((project) => (
            <div key={project.name} className="rounded-2xl border-[3px] border-line bg-surface p-4 shadow-brut-xs">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold">{project.name}</p>
                {project.tag && (
                  <span className="rounded-full border-2 border-line bg-raised px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-accent">
                    {project.tag}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted">{project.description}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section {...rise} data-testid="education-certs">
        <SectionTitle>Education & Certs</SectionTitle>
        <div className="mt-3 flex flex-col gap-3">
          {profile.education.map((edu) => (
            <div key={edu.title} className="rounded-2xl border-[3px] border-line bg-surface p-4">
              <p className="text-sm font-bold">{edu.title}</p>
              <p className="text-xs text-muted">
                {edu.org} · {edu.period}
              </p>
            </div>
          ))}
          {profile.certifications.map((cert) => (
            <div key={cert.title} className="flex items-center gap-3 rounded-2xl border-[3px] border-line bg-surface p-4">
              <BadgeCheck className="size-5 shrink-0 text-accent" />
              <div className="min-w-0">
                <p className="text-sm font-bold">{cert.title}</p>
                <p className="text-xs text-muted">
                  {cert.issuer} · {cert.year}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section {...rise} data-testid="links">
        <SectionTitle>Links</SectionTitle>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {profile.links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              data-testid={`link-${link.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              className="flex items-center justify-between gap-2 rounded-xl border-[3px] border-line bg-surface px-3 py-2.5 text-xs font-extrabold uppercase tracking-wide transition-all hover:-translate-y-0.5 hover:shadow-brut-xs"
            >
              {link.label}
              <ExternalLink className="size-3.5 shrink-0 text-accent" />
            </a>
          ))}
        </div>
        <a
          href={profile.resumeUrl}
          download
          data-testid="resume-download"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-[3px] border-line bg-accent px-4 py-3 font-display text-sm uppercase tracking-wide text-white shadow-brut-sm transition-all hover:-translate-y-0.5 hover:shadow-brut"
        >
          <Download className="size-4" />
          Resume
        </a>
      </motion.section>
    </motion.div>
  );
}
