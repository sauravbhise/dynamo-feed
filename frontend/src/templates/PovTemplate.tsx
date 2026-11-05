import { CharacterSlot } from "../components/CharacterSlot";
import { ReelCaption } from "../components/ReelCaption";
import { ProfileReelChip } from "../components/ProfileReelChip";
import { ReelBackground } from "./ReelBackground";
import { castById } from "../content";
import { str, type TemplateProps } from "./registry";

/** A native-feeling POV caption: the line floats over the whole reel. */
export function PovTemplate({ reel, beat, data }: TemplateProps) {
  const pov = str(data.pov);

  return (
    <div className="absolute inset-0">
      <ReelBackground reel={reel} />

      {pov && (
        <p
          data-testid="pov-text"
          className="absolute left-1/2 top-[7%] z-10 max-w-[86%] -translate-x-1/2 text-center font-display text-[24px] font-bold leading-tight text-cream md:text-[26px]"
          style={{ textShadow: "0 2px 14px rgba(0, 0, 0, 0.9), 0 0 6px rgba(0, 0, 0, 0.7)" }}
        >
          {pov}
        </p>
      )}

      <CharacterSlot characterId={beat.characterId} pose={beat.pose} isSpeaking heightPercent={40} />

      <div className="absolute inset-x-4 bottom-5 z-10">
        <ReelCaption name={castById[beat.characterId]?.name ?? ""} chip={<ProfileReelChip slug={reel.slug} />}>
          {beat.caption}
        </ReelCaption>
      </div>
    </div>
  );
}
