import { FileText, Github, Globe, Linkedin, Mail } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SocialLink } from "../../content/types";

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
};

const SOCIAL_NAMES: Record<string, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  email: "Email",
};

function socialIcon(platform: string): LucideIcon {
  return SOCIAL_ICONS[platform.toLowerCase()] ?? Globe;
}

export function SocialLinks({ socials, resumeUrl }: { socials: SocialLink[]; resumeUrl: string }) {
  // Fully visible from the start — the column fade owns the entrance.
  return (
    <div className="flex justify-center gap-3" data-testid="social-links">
      {socials.map((social) => {
        const Icon = socialIcon(social.platform);
        const label = SOCIAL_NAMES[social.platform.toLowerCase()] ?? social.platform;
        return (
          <a
            key={social.platform}
            href={social.url}
            target={social.url.startsWith("mailto:") ? undefined : "_blank"}
            rel="noreferrer"
            aria-label={label}
            title={label}
            data-testid={`social-${social.platform}`}
            className="grid size-11 place-items-center rounded-full bg-surface text-cream/80 shadow-soft transition hover:-translate-y-0.5 hover:text-sage"
          >
            <Icon className="size-[18px]" />
          </a>
        );
      })}
      <a
        href={resumeUrl}
        target="_blank"
        rel="noreferrer"
        aria-label="Resume"
        title="Resume"
        data-testid="social-resume"
        className="grid size-11 place-items-center rounded-full bg-surface text-cream/80 shadow-soft transition hover:-translate-y-0.5 hover:text-sage"
      >
        <FileText className="size-[18px]" />
      </a>
    </div>
  );
}
