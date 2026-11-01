import { motion } from "framer-motion";
import { Download, Mail } from "lucide-react";

export function FooterCta({ email, resumeUrl }: { email: string; resumeUrl: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="rounded-3xl bg-surface p-5 text-center shadow-soft"
      data-testid="talk-footer"
    >
      <p className="font-display text-base text-cream">Talk to the human instead</p>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Skip the cartoons — a real chat gets real answers.
      </p>
      <div className="mt-4 flex justify-center gap-2.5">
        <a
          href={`mailto:${email}`}
          data-testid="footer-email"
          className="flex items-center gap-1.5 rounded-full bg-sage px-4 py-2.5 text-sm font-bold text-sage-deep shadow-soft transition hover:brightness-105 active:scale-95"
        >
          <Mail className="size-4" />
          Email
        </a>
        <a
          href={resumeUrl}
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
  );
}
