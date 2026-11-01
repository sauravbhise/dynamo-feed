import { AnimatePresence, motion, useDragControls } from "framer-motion";
import type { PanInfo } from "framer-motion";
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
  const dragControls = useDragControls();

  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    if (isBottom && (info.offset.y > 90 || info.velocity.y > 600)) onClose();
    if (!isBottom && (info.offset.x < -90 || info.velocity.x < -600)) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            data-testid="sheet-overlay"
            className="fixed inset-0 z-40 bg-black/60"
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
                ? "fixed inset-x-0 bottom-0 z-50 flex max-h-[82dvh] flex-col rounded-t-3xl bg-surface shadow-card"
                : "fixed inset-y-0 left-0 z-50 flex w-[min(92vw,380px)] flex-col rounded-r-3xl bg-surface shadow-card"
            }
            initial={isBottom ? { y: "100%" } : { x: "-100%" }}
            animate={isBottom ? { y: 0 } : { x: 0 }}
            exit={isBottom ? { y: "100%" } : { x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            drag={isBottom ? "y" : "x"}
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.55}
            onDragEnd={handleDragEnd}
          >
            <div
              className="shrink-0 cursor-grab touch-none active:cursor-grabbing"
              onPointerDown={(event) => dragControls.start(event)}
            >
              {isBottom && (
                <span className="mx-auto mt-3 h-1 w-10 rounded-full bg-white/20" aria-hidden="true" />
              )}
              <div className="flex items-center justify-between gap-3 px-5 pb-3 pt-3">
                <h2 className="font-display text-lg text-cream">{title}</h2>
                <button
                  data-testid="sheet-close"
                  onClick={onClose}
                  aria-label="Close"
                  className="grid size-9 place-items-center rounded-full bg-white/10 text-cream transition hover:bg-white/20"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
