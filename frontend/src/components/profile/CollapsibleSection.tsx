import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { ItemCard } from "./ItemCard";
import type { ProfileItemDisplay } from "./ItemCard";
import type { ProfileSectionKey } from "../../content/types";

export function CollapsibleSection({
  sectionKey,
  label,
  items,
  open,
  onToggle,
  highlightedId,
  onWatchReel,
}: {
  sectionKey: ProfileSectionKey;
  label: string;
  items: ProfileItemDisplay[];
  open: boolean;
  onToggle: () => void;
  highlightedId: string | null;
  onWatchReel: (slug: string) => void;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
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
      {/* Collapsed sections still say something: a one-line, muted preview of
          the first two item titles. */}
      {!open && (
        <p
          className="truncate px-5 pb-4 -mt-1.5 text-xs leading-snug text-muted"
          data-testid={`section-preview-${sectionKey}`}
        >
          {items.slice(0, 2).map((item) => item.title).join(" · ")}
          {items.length > 2 ? ` · +${items.length - 2}` : ""}
        </p>
      )}
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
                <ItemCard
                  key={item.id}
                  item={item}
                  highlighted={highlightedId === item.id}
                  onWatchReel={onWatchReel}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
