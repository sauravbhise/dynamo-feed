import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

type SheetSide = "left" | "bottom";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  side: SheetSide;
  title: string;
  children: ReactNode;
  testId?: string;
}

export function Sheet({ open, onClose, side, title, children, testId }: SheetProps) {
  const isBottom = side === "bottom";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            data-testid="sheet-overlay"
            className="fixed inset-0 z-40 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            key="panel"
            data-testid={testId}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={
              isBottom
                ? "fixed inset-x-0 bottom-0 z-50 flex max-h-[82dvh] flex-col rounded-t-3xl border-t-[3px] border-line bg-surface"
                : "fixed inset-y-0 left-0 z-50 flex w-[min(92vw,380px)] flex-col border-r-[3px] border-line bg-surface"
            }
            initial={isBottom ? { y: "100%" } : { x: "-100%" }}
            animate={isBottom ? { y: 0 } : { x: 0 }}
            exit={isBottom ? { y: "100%" } : { x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b-[3px] border-line px-4 py-3">
              <h2 className="font-display text-sm uppercase tracking-[0.18em]">{title}</h2>
              <button
                data-testid="sheet-close"
                onClick={onClose}
                aria-label="Close"
                className="grid size-9 place-items-center rounded-xl border-[3px] border-line bg-raised transition-transform hover:-translate-y-0.5"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="scrollbar-brut min-h-0 flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
