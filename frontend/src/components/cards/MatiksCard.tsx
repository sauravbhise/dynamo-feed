import { StreakCard } from "./StreakCard";
import { contentUsable, wholeDaysSince } from "../../content";

export function MatiksCard({ matiks }: { matiks: { streak: number; streakAsOf: string } }) {
  // A draft date would make up a streak; no streak → no card.
  if (!contentUsable(matiks.streakAsOf)) return null;
  const streak = matiks.streak + wholeDaysSince(matiks.streakAsOf);
  if (streak <= 0) return null;
  return <StreakCard title="Matiks" streak={streak} testId="now-matiks" />;
}
