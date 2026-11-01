import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { profile } from "../content";
import { ProfileHeader } from "./profile/ProfileHeader";
import { SocialLinks } from "./profile/SocialLinks";
import { SkillChips } from "./profile/SkillChips";
import { CollapsibleSection } from "./profile/CollapsibleSection";
import type { ProfileItemDisplay } from "./profile/ItemCard";
import type { ProfileSectionKey } from "../content/types";

function goToReel(slug: string) {
  window.dispatchEvent(new CustomEvent<string>("dynamo:goto-reel", { detail: slug }));
}

/** Condensed portfolio — renders the profile blocks in order; each block is its own component. */
export function LeftColumn() {
  // Each section opens and closes independently; Experience and Projects start open.
  const [openKeys, setOpenKeys] = useState<Set<ProfileSectionKey>>(
    () => new Set<ProfileSectionKey>(["experience", "projects"])
  );
  const [highlightId, setHighlightId] = useState<string | null>(null);

  // A reel's chip focuses (and flashes) the matching portfolio item here.
  useEffect(() => {
    const onFocus = (event: Event) => {
      const detail = (event as CustomEvent<{ section: ProfileSectionKey; itemId: string }>).detail;
      setOpenKeys((keys) => new Set(keys).add(detail.section));
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

  const allSections: { key: ProfileSectionKey; label: string; items: ProfileItemDisplay[] }[] = [
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
    // One short fade of the whole column on page load — no per-section,
    // scroll-triggered entrances (in-view detection misfires inside the
    // column's own scroll container and left sections invisible).
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col gap-6 p-6"
      data-testid="left-column-content"
    >
      <ProfileHeader
        name={profile.name}
        oneLiner={profile.oneLiner}
        photo={profile.photo}
        location={profile.location}
      />
      <SocialLinks socials={profile.socials} resumeUrl={profile.resumeUrl} />
      <SkillChips skills={profile.skills} />
      {sections.map((section) => (
        <CollapsibleSection
          key={section.key}
          sectionKey={section.key}
          label={section.label}
          items={section.items}
          open={openKeys.has(section.key)}
          onToggle={() =>
            setOpenKeys((keys) => {
              const next = new Set(keys);
              if (next.has(section.key)) next.delete(section.key);
              else next.add(section.key);
              return next;
            })
          }
          highlightedId={highlightId}
          onWatchReel={goToReel}
        />
      ))}
    </motion.div>
  );
}
