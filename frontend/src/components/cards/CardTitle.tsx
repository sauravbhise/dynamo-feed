import type { LucideIcon } from "lucide-react";

/** Shared card heading used by every Off-the-clock card. */
export function CardTitle({ icon: Icon, children }: { icon: LucideIcon; children: string }) {
  return (
    <h3 className="flex items-center gap-2 font-display text-base text-cream">
      <Icon className="size-4 text-sage" />
      {children}
    </h3>
  );
}
