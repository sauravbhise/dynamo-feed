import { motion } from "framer-motion";
import { Download, Github, Globe, Linkedin, Mail } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SocialLink } from "../../content/types";

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
};

function socialIcon(platform: string): LucideIcon {
  return SOCIAL_ICONS[platform.toLowerCase()] ?? Globe;
}

export function SocialLinks({ socials, resumeUrl }: { socials: SocialLink[]; resumeUrl: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex justify-center gap-3"
      data-testid="social-links"
    >
      {socials.map((social) => {
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
        href={resumeUrl}
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
  );
}
