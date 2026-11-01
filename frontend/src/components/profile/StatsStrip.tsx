import { motion } from "framer-motion";
import type { StatItem } from "../../content/types";

export function StatsStrip({ stats }: { stats: StatItem[] }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="grid grid-cols-2 gap-2.5"
      data-testid="stats-strip"
    >
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl bg-surface p-3.5 shadow-soft">
          <p className="font-display text-xl text-cream">{stat.value}</p>
          <p className="text-[11px] font-semibold text-muted">{stat.label}</p>
        </div>
      ))}
    </motion.section>
  );
}
