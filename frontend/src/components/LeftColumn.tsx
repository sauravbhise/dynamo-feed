import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  ChevronDown,
  Clapperboard,
  Download,
  Github,
  Globe,
  Linkedin,
  Mail,
  MapPin,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { profile } from "../content";
import type { ProfileSectionKey } from "../content/types";

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
};

function socialIcon(platform: string): LucideIcon {
  return SOCIAL_ICONS[platform.toLowerCase()] ?? Globe;
}

const headerItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const rise = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.5, ease: "easeOut" },
};

interface DisplayItem {
  id: string;
  title: string;
  subtitle: string;
  dates?: string;
  text?: string;
  reelSlug?: string;
  links?: { label: string; url: string }[];
}

function goToReel(slug: string) {
  window.dispatchEvent(new CustomEvent<string>("dynamo:goto-reel", { detail: slug }));
}

function ItemCard({ item, highlighted }: { item: DisplayItem; highlighted: boolean }) {
  return (
    <div
      id={`profile-item-${item.id}`}
      data-item-id={item.id}
      data-testid={`profile-item-${item.id}`}
      className={`rounded-2xl bg-raised p-4 transition-shadow duration-500 ${
        highlighted ? "ring-2 ring-sage" : "ring-0 ring-transparent"
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-display text-sm leading-snug text-cream">{item.title}</p>
        {item.dates && (
          <span className="shrink-0 text-[11px] font-semibold text-muted">{item.dates}</span>
        )}
      </div>
      {item.subtitle && <p className="mt-0.5 text-xs font-semibold text-sage">{item.subtitle}</p>}
      {item.text && <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{item.text}</p>}
      {item.links && item.links.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-3">
          {item.links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-0.5 text-xs font-bold text-sage underline-offset-2 hover:underline"
            >
              {link.label}
              <ArrowUpRight className="size-3.5" />
            </a>
          ))}
        </div>
      )}
      {item.reelSlug && (
        <button
          type="button"
          data-testid={`watch-reel-${item.reelSlug}`}
          onClick={() => goToReel(item.reelSlug!)}
          className="mt-2.5 flex items-center gap-1.5 rounded-full bg-ink/60 px-3 py-1.5 text-[11px] font-bold text-cream transition hover:bg-ink hover:text-sage active:scale-95"
        >
          <Clapperboard className="size-3.5" />
          Watch the reel
        </button>
      )}
    </div>
  );
}

function CollapsibleSection({
  sectionKey,
  label,
  items,
  open,
  onToggle,
  highlightedId,
}: {
  sectionKey: ProfileSectionKey;
  label: string;
  items: DisplayItem[];
  open: boolean;
  onToggle: () => void;
  highlightedId: string | null;
}) {
  return (
    <motion.section
      {...rise}
      className="overflow-hidden rounded-2xl bg-surface shadow-soft"
      data-testid={`profile-section-${sectionKey}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        data-testid={`section-toggle-${sectionKey}`}
        className="flex w-full items-center justify-between gap-2 px-5 py-4 text-left transition hover:bg-raised/40"
      >
        <span className="flex items-center gap-2.5 text-sm font-bold text-cream">
          {label}
          <span className="rounded-full bg-raised px-2 py-0.5 text-[11px] font-bold text-muted">
            {items.length}
          </span>
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="size-4 text-muted" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="items"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2.5 px-3.5 pb-3.5">
              {items.map((item) => (
                <ItemCard key={item.id} item={item} highlighted={highlightedId === item.id} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

export function LeftColumn() {
  const [photoSrc, setPhotoSrc] = useState(profile.photo);
  const [openKey, setOpenKey] = useState<ProfileSectionKey | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  // A reel's chip focuses (and flashes) the matching portfolio item here.
  useEffect(() => {
    const onFocus = (event: Event) => {
      const detail = (event as CustomEvent<{ section: ProfileSectionKey; itemId: string }>).detail;
      setOpenKey(detail.section);
      setHighlightId(detail.itemId);
      window.setTimeout(() => {
        document
          .getElementById(`profile-item-${detail.itemId}`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 350);
      window.setTimeout(() => setHighlightId(null), 2600);
    };
    window.addEventListener("dynamo:focus-profile-item", onFocus);
    return () => window.removeEventListener("dynamo:focus-profile-item", onFocus);
  }, []);

  const allSections: { key: ProfileSectionKey; label: string; items: DisplayItem[] }[] = [
    {
      key: "experience",
      label: "Experience",
      items: profile.experience.map((entry, i) => ({
        id: `experience-${i}`,
        title: entry.title,
        subtitle: entry.org,
        dates: entry.dates,
        text: entry.text,
        reelSlug: entry.reelSlug,
      })),
    },
    {
      key: "projects",
      label: "Projects",
      items: profile.projects.map((entry, i) => ({
        id: `projects-${i}`,
        title: entry.name,
        subtitle: entry.tags.join(" · "),
        text: entry.text,
        links: entry.links,
        reelSlug: entry.reelSlug,
      })),
    },
    {
      key: "writing",
      label: "Writing and research",
      items: profile.writing.map((entry, i) => ({
        id: `writing-${i}`,
        title: entry.title,
        subtitle: [entry.venue, entry.role].filter(Boolean).join(" · "),
        dates: entry.year,
      })),
    },
    {
      key: "community",
      label: "Community",
      items: profile.community.map((entry, i) => ({
        id: `community-${i}`,
        title: entry.title,
        subtitle: entry.org,
        dates: entry.dates,
        text: entry.text,
        reelSlug: entry.reelSlug,
      })),
    },
    {
      key: "education",
      label: "Education and certifications",
      items: [
        ...profile.education.map((entry, i) => ({
          id: `education-${i}`,
          title: entry.title,
          subtitle: entry.org,
          dates: entry.dates,
          text: entry.text,
        })),
        ...profile.certifications.map((entry, i) => ({
          id: `education-cert-${i}`,
          title: entry.name,
          subtitle: entry.issuer,
        })),
      ],
    },
  ];
  const sections = allSections.filter((section) => section.items.length > 0);

  return (
    <div className="flex flex-col gap-6 p-6" data-testid="left-column-content">
      <motion.header
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } }}
        className="flex flex-col items-center gap-3 text-center"
        data-testid="profile-header"
      >
        <motion.img
          variants={headerItem}
          src={photoSrc}
          onError={() => setPhotoSrc("/avatar.svg")}
          alt={profile.name}
          data-testid="profile-photo"
          className="size-32 rounded-full object-cover shadow-card ring-4 ring-cast-saurav/30"
        />
        <motion.div variants={headerItem}>
          <h1 className="font-display text-3xl leading-tight text-cream" data-testid="profile-name">
            {profile.name}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{profile.oneLiner}</p>
        </motion.div>
        <motion.span
          variants={headerItem}
          className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted"
          data-testid="profile-location"
        >
          <MapPin className="size-3.5 text-sage" />
          {profile.location}
        </motion.span>
        <motion.div variants={headerItem} className="flex justify-center gap-3" data-testid="social-links">
          {profile.socials.map((social) => {
            const Icon = socialIcon(social.platform);
            return (
              <a
                key={social.platform}
                href={social.url}
                target={social.url.startsWith("mailto:") ? undefined : "_blank"}
                rel="noreferrer"
                aria-label={social.platform}
                title={social.platform}
                data-testid={`social-${social.platform}`}
                className="grid size-11 place-items-center rounded-full bg-surface text-cream/80 shadow-soft transition hover:-translate-y-0.5 hover:text-sage"
              >
                <Icon className="size-[18px]" />
              </a>
            );
          })}
          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Resume"
            title="Resume"
            data-testid="social-resume"
            className="grid size-11 place-items-center rounded-full bg-sage text-sage-deep shadow-soft transition hover:-translate-y-0.5 active:scale-95"
          >
            <Download className="size-[18px]" />
          </a>
        </motion.div>
      </motion.header>

      <motion.section {...rise} className="grid grid-cols-2 gap-2.5" data-testid="stats-strip">
        {profile.stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-surface p-3.5 shadow-soft">
            <p className="font-display text-xl text-cream">{stat.value}</p>
            <p className="text-[11px] font-semibold text-muted">{stat.label}</p>
          </div>
        ))}
      </motion.section>

      {sections.map((section) => (
        <CollapsibleSection
          key={section.key}
          sectionKey={section.key}
          label={section.label}
          items={section.items}
          open={openKey === section.key}
          onToggle={() => setOpenKey(openKey === section.key ? null : section.key)}
          highlightedId={highlightId}
        />
      ))}

      <motion.section
        {...rise}
        className="rounded-3xl bg-surface p-5 text-center shadow-soft"
        data-testid="talk-footer"
      >
        <p className="font-display text-base text-cream">Talk to the human instead</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Skip the cartoons — a real chat gets real answers.
        </p>
        <div className="mt-4 flex justify-center gap-2.5">
          <a
            href={`mailto:${profile.email}`}
            data-testid="footer-email"
            className="flex items-center gap-1.5 rounded-full bg-sage px-4 py-2.5 text-sm font-bold text-sage-deep shadow-soft transition hover:brightness-105 active:scale-95"
          >
            <Mail className="size-4" />
            Email
          </a>
          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noreferrer"
            data-testid="footer-resume"
            className="flex items-center gap-1.5 rounded-full bg-raised px-4 py-2.5 text-sm font-bold text-cream shadow-soft transition hover:brightness-110 active:scale-95"
          >
            <Download className="size-4" />
            Resume
          </a>
        </div>
      </motion.section>
    </div>
  );
}
