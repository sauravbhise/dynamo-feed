import { motion } from "framer-motion";
import { FileText, Linkedin, Mail } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CharacterSlot } from "../components/CharacterSlot";
import { ReelBackground } from "./ReelBackground";
import { castById, profile } from "../content";
import type { TemplateProps } from "./registry";

export function NudgeTemplate({ reel, beat, reducedMotion, paused }: TemplateProps) {
  const linkedinUrl = profile.socials.find((s) => s.platform === "linkedin")?.url;
  const buttons: { label: string; href: string; icon: LucideIcon }[] = [
    { label: "Email", href: `mailto:${profile.email}`, icon: Mail },
    ...(linkedinUrl ? [{ label: "LinkedIn", href: linkedinUrl, icon: Linkedin }] : []),
    { label: "Resume", href: profile.resumeUrl, icon: FileText },
  ];

  return (
    <div className="absolute inset-0">
      <ReelBackground reel={reel} />

      <CharacterSlot characterId={beat.characterId} pose={beat.pose} isSpeaking={false} paused={paused} heightPercent={40} />

      <div className="absolute inset-x-4 bottom-[5%] z-10 flex flex-col gap-2.5">
        <span
          className="text-xs font-bold text-cream/90 [text-shadow:0_1px_8px_rgba(0,0,0,0.45)]"
          data-testid="speaker-name"
        >
          {castById[beat.characterId]?.name ?? ""}
        </span>
        <motion.p
          className="rounded-3xl bg-surface/90 p-4 text-center font-display text-[15px] leading-snug text-cream shadow-card backdrop-blur"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          data-testid="nudge-message"
        >
          {beat.caption}
        </motion.p>
        <div className="flex flex-wrap justify-center gap-2.5" data-testid="nudge-actions">
          {buttons.map((button) => (
            <a
              key={button.label}
              href={button.href}
              target={button.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noreferrer"
              onClick={(event) => event.stopPropagation()}
              data-testid={`nudge-${button.label.toLowerCase()}`}
              className="flex items-center gap-1.5 rounded-full bg-sage px-4 py-2.5 text-sm font-bold text-sage-deep shadow-soft transition hover:brightness-105 active:scale-95"
            >
              <button.icon className="size-4" />
              {button.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
