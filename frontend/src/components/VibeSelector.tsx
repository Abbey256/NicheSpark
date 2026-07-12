import type { Vibe } from "@/types";
import { vibeLabel } from "@/lib/utils";
import { cn } from "@/lib/cn";

const VIBES: Vibe[] = [
  "surprise-me",
  "motivational",
  "educational",
  "quick-tip",
  "case-study",
  "personal-story",
  "trending",
];

interface Props {
  value: Vibe;
  onChange: (v: Vibe) => void;
}

export default function VibeSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {VIBES.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150",
            value === v
              ? "bg-primary/15 border-primary/50 text-primary shadow-sm"
              : "bg-secondary border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
          )}
        >
          {vibeLabel(v)}
        </button>
      ))}
    </div>
  );
}
