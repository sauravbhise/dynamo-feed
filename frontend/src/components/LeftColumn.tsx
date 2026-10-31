import { motion } from "framer-motion";
import {
  BadgeCheck,
  BookOpen,
  Clapperboard,
  Download,
  Github,
  Linkedin,
  Mail,
  Twitter,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cast, profile, SELF_COLOR } from "../content";

const rise = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const headerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  github: Github,
  xtwitter: Twitter,
  linkedin: Linkedin,
  email: Mail,
};

function socialIcon(label: string): LucideIcon {
  return SOCIAL_ICONS[label.toLowerCase().replace(/[^a-z]/g, "")] ?? Mail;
}

function SectionTitle({ children }: { children: string }) {
  return <h2 className="text-xs font-bold text-muted">{children}</h2>;
}

function StoryRing({ title, color }: { title: string; color: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-1.5" data-testid="story-ring">
      <span className="grid size-14 place-items-center rounded-full p-[3px]" style={{ backgroundColor: color }}>
        <span className="grid size-full place-items-center rounded-full bg-ink font-display text-xs text-cream">
          {title.slice(0, 2)}
        </span>
      </span>
      <span className="max-w-16 truncate text-[11px] font-semibold text-muted">{title}</span>
    </div>
  );
}

export function LeftColumn() {
  const rings = [
    { title: "Me", color: SELF_COLOR },
    ...profile.stories.map((story, i) => ({ title: story.title, color: cast[i]?.color ?? SELF_COLOR })),
  ];

  return (
    <div className="flex flex-col gap-8 p-6" data-testid="left-column-content">
      <motion.header
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } }}
        className="flex flex-col items-center gap-4 text-center"
        data-testid="profile-header"
      >
        <motion.img
          variants={headerItem}
          src={profile.photo}
          alt={profile.name}
          data-testid="profile-photo"
          className="size-36 rounded-full object-cover shadow-card ring-4 ring-cast-self/30"
        />
        <motion.div variants={headerItem}>
          <h1 className="font-display text-3xl leading-tight text-cream" data-testid="profile-name">
            {profile.name}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{profile.oneLiner}</p>
        </motion.div>
        <motion.div variants={headerItem} className="flex justify-center gap-3" data-testid="social-links">
          {profile.links.map((link) => {
            const Icon = socialIcon(link.label);
            return (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                aria-label={link.label}
                title={link.label}
                data-testid={`social-${link.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                className="grid size-11 place-items-center rounded-full bg-surface text-cream/80 shadow-soft transition hover:-translate-y-0.5 hover:text-sage"
              >
                <Icon className="size-[18px]" />
              </a>
            );
          })}
        </motion.div>
      </motion.header>

      <motion.section {...rise} data-testid="story-rings">
        <SectionTitle>Stories</SectionTitle>
        <div className="scrollbar-soft mt-3 flex gap-4 overflow-x-auto pb-1">
          {rings.map((ring) => (
            <StoryRing key={ring.title} {...ring} />
          ))}
        </div>
      </motion.section>

      <motion.section {...rise} data-testid="stats-strip">
        <SectionTitle>Stats</SectionTitle>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {profile.stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-surface p-4 shadow-soft">
              <p className="font-display text-xl text-cream">{stat.value}</p>
              <p className="text-[11px] font-semibold text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section {...rise} data-testid="now-section">
        <SectionTitle>Now</SectionTitle>
        <div className="mt-3 flex flex-col gap-3 rounded-2xl bg-surface p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sage/15 text-sage">
              <BookOpen className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-muted">Reading</p>
              <p className="truncate text-sm font-semibold text-cream">{profile.now.reading}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sage/15 text-sage">
              <Clapperboard className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-muted">Watching</p>
              <p className="truncate text-sm font-semibold text-cream">{profile.now.watching}</p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section {...rise} data-testid="highlights">
        <SectionTitle>Highlights</SectionTitle>
        <div className="mt-3 flex flex-wrap gap-2">
          {profile.highlights.map((highlight) => (
            <span key={highlight} className="rounded-full bg-surface px-3.5 py-1.5 text-xs font-semibold text-cream/90 shadow-soft">
              {highlight}
            </span>
          ))}
        </div>
      </motion.section>

      <motion.section {...rise} data-testid="experience">
        <SectionTitle>Experience</SectionTitle>
        <div className="mt-3 flex flex-col gap-3">
          {profile.experience.map((job) => (
            <div key={job.role} className="rounded-2xl bg-surface p-5 shadow-soft">
              <p className="text-[11px] font-semibold text-muted">{job.period}</p>
              <p className="mt-1 font-display text-sm text-cream">{job.role}</p>
              <p className="text-xs font-bold text-sage">{job.company}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{job.note}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section {...rise} data-testid="projects">
        <SectionTitle>Projects</SectionTitle>
        <div className="mt-3 flex flex-col gap-3">
          {profile.projects.map((project) => (
            <div key={project.name} className="rounded-2xl bg-surface p-5 shadow-soft">
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-sm text-cream">{project.name}</p>
                {project.tag && (
                  <span className="rounded-full bg-sage/15 px-2.5 py-0.5 text-[11px] font-bold text-sage">
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
        <SectionTitle>Education & certs</SectionTitle>
        <div className="mt-3 flex flex-col gap-3">
          {profile.education.map((edu) => (
            <div key={edu.title} className="rounded-2xl bg-surface p-5 shadow-soft">
              <p className="font-display text-sm text-cream">{edu.title}</p>
              <p className="mt-0.5 text-xs text-muted">
                {edu.org} · {edu.period}
              </p>
            </div>
          ))}
          {profile.certifications.map((cert) => (
            <div key={cert.title} className="flex items-center gap-3 rounded-2xl bg-surface p-5 shadow-soft">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-sage/15 text-sage">
                <BadgeCheck className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-sm text-cream">{cert.title}</p>
                <p className="text-xs text-muted">
                  {cert.issuer} · {cert.year}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section {...rise} data-testid="resume">
        <a
          href={profile.resumeUrl}
          download
          data-testid="resume-download"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-sage px-4 py-3 text-sm font-bold text-sage-deep shadow-soft transition hover:brightness-105 active:scale-[0.99]"
        >
          <Download className="size-4" />
          Download resume
        </a>
      </motion.section>
    </div>
  );
}
