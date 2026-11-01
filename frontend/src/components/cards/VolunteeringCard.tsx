import { Users } from "lucide-react";

export function VolunteeringCard({ volunteering }: { volunteering: { status: string; text: string } }) {
  return (
    <section className="rounded-2xl bg-surface p-5 shadow-soft" data-testid="now-volunteering">
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sage/15 text-sage">
          <Users className="size-5" />
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-display text-sm text-cream">Volunteering</p>
            {volunteering.status && (
              <span className="rounded-full bg-sage/15 px-2 py-0.5 text-[10px] font-bold text-sage">
                {volunteering.status}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted">{volunteering.text}</p>
        </div>
      </div>
    </section>
  );
}
