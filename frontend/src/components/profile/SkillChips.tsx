import { motion } from "framer-motion";

/** Compact, wrapping row of skill chips — hidden entirely when the list is empty. */
export function SkillChips({ skills }: { skills: string[] }) {
  if (skills.length === 0) return null;
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-wrap justify-center gap-2"
      data-testid="skill-chips"
    >
      {skills.map((skill) => (
        <span
          key={skill}
          className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted shadow-soft"
          data-testid="skill-chip"
        >
          {skill}
        </span>
      ))}
    </motion.section>
  );
}
