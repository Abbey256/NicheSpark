import { useState, useEffect, useRef } from "react";
import { Timer, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/cn";

const DURATION = 25 * 60; // 25 minutes

const NUDGES: Record<number, string> = {
  1200: "20 min in — pick your top 3 ideas and start drafting.",
  1500: "Time's up! You've been creating for 25 minutes. Post something today.",
};

export default function PomodoroTimer() {
  const [remaining, setRemaining] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [nudge, setNudge] = useState("");
  const elapsed = DURATION - remaining;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          const next = Math.max(0, r - 1);
          const e = DURATION - next;
          if (NUDGES[e]) setNudge(NUDGES[e]);
          if (next === 0) setRunning(false);
          return next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  function reset() {
    setRunning(false);
    setRemaining(DURATION);
    setNudge("");
  }

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct = (elapsed / DURATION) * 100;
  const isDone = remaining === 0;

  return (
    <div className="flex flex-col items-end gap-1.5 shrink-0">
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-colors",
          running
            ? "bg-primary/10 border-primary/30 text-primary"
            : isDone
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            : "bg-secondary border-border text-muted-foreground"
        )}
      >
        <Timer className="size-3.5 shrink-0" />
        <span className="font-mono text-sm">
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </span>

        <div className="flex items-center gap-1 ml-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-6 w-6"
            onClick={() => setRunning((r) => !r)}
            disabled={isDone}
            title={running ? "Pause" : "Start 25-min session"}
          >
            {running ? <Pause className="size-3" /> : <Play className="size-3" />}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-6 w-6"
            onClick={reset}
            title="Reset timer"
          >
            <RotateCcw className="size-3" />
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      {(running || elapsed > 0) && (
        <Progress value={pct} className="w-full max-w-[200px] h-1" />
      )}

      {/* Nudge */}
      {nudge && (
        <p className="text-xs text-primary/80 max-w-[220px] text-right animate-fade-in leading-tight">
          {nudge}
        </p>
      )}
    </div>
  );
}
