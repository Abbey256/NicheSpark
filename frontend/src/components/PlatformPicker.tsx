import type { Platform } from "@/types";
import { platformLabel } from "@/lib/utils";
import { cn } from "@/lib/cn";

const ALL_PLATFORMS: Platform[] = ["instagram", "tiktok", "linkedin", "twitter", "youtube"];

interface Props {
  value: Platform[];
  onChange: (platforms: Platform[]) => void;
  available: Platform[];
}

export default function PlatformPicker({ value, onChange, available }: Props) {
  const platforms = available.length > 0 ? available : ALL_PLATFORMS;

  function toggle(p: Platform) {
    onChange(value.includes(p) ? value.filter((x) => x !== p) : [...value, p]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map((p) => {
        const selected = value.includes(p);
        return (
          <button
            key={p}
            type="button"
            onClick={() => toggle(p)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150",
              selected
                ? "bg-primary/15 border-primary/40 text-primary"
                : "bg-secondary border-border text-muted-foreground hover:text-foreground hover:border-border/80"
            )}
          >
            {platformLabel(p)}
          </button>
        );
      })}
    </div>
  );
}
