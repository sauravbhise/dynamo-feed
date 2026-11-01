/** Compact, wrapping row of skill chips — hidden entirely when the list is empty. */
export function SkillChips({ skills }: { skills: string[] }) {
  if (skills.length === 0) return null;
  // Fully visible from the start — the column fade owns the entrance.
  return (
    <section className="flex flex-wrap justify-center gap-2" data-testid="skill-chips">
      {skills.map((skill) => (
        <span
          key={skill}
          className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted shadow-soft"
          data-testid="skill-chip"
        >
          {skill}
        </span>
      ))}
    </section>
  );
}
