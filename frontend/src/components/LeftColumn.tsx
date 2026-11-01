import { useEffect, useState } from "react";
import { profile } from "../content";
import { ProfileHeader } from "./profile/ProfileHeader";
import { SocialLinks } from "./profile/SocialLinks";
import { StatsStrip } from "./profile/StatsStrip";
import { CollapsibleSection } from "./profile/CollapsibleSection";
import { FooterCta } from "./profile/FooterCta";
import type { ProfileItemDisplay } from "./profile/ItemCard";
import type { ProfileSectionKey } from "../content/types";

function goToReel(slug: string) {
  window.dispatchEvent(new CustomEvent<string>("dynamo:goto-reel", { detail: slug }));
}

/** Condensed portfolio — renders the profile blocks in order; each block is its own component. */
export function LeftColumn() {
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
    <div className="flex flex-col gap-6 p-6" data-testid="left-column-content">
      <ProfileHeader
        name={profile.name}
        oneLiner={profile.oneLiner}
        photo={profile.photo}
        location={profile.location}
      />
      <SocialLinks socials={profile.socials} resumeUrl={profile.resumeUrl} />
      <StatsStrip stats={profile.stats} />
      {sections.map((section) => (
        <CollapsibleSection
          key={section.key}
          sectionKey={section.key}
          label={section.label}
          items={section.items}
          open={openKey === section.key}
          onToggle={() => setOpenKey(openKey === section.key ? null : section.key)}
          highlightedId={highlightId}
          onWatchReel={goToReel}
        />
      ))}
      <FooterCta email={profile.email} resumeUrl={profile.resumeUrl} />
    </div>
  );
}
