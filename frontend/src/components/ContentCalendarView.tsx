import { useState } from "react";
import { Copy, Check, Calendar } from "lucide-react";
import type { ContentCalendar, CalendarDay } from "@/lib/onboardingAI";
import { platformLabel, platformColor, copyToClipboard } from "@/lib/utils";
import { useToast } from "@/hooks/useToast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const VIBE_COLORS: Record<string, string> = {
  motivational:    "border-orange-500/30 bg-orange-500/10 text-orange-400",
  educational:     "border-blue-500/30 bg-blue-500/10 text-blue-400",
  "case-study":    "border-purple-500/30 bg-purple-500/10 text-purple-400",
  "quick-tip":     "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  "personal-story":"border-pink-500/30 bg-pink-500/10 text-pink-400",
  trending:        "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  "surprise-me":   "border-primary/30 bg-primary/10 text-primary",
};

function DayCard({ day, name }: { day: CalendarDay; name: string }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = [day.hook, "", day.bodyPreview, "", day.hashtags.join(" ")].join("\n");
    await copyToClipboard(text);
    setCopied(true);
    toast("Copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  const scoreCls = day.viralityScore >= 8 ? "score-high" : day.viralityScore >= 6 ? "score-mid" : "score-low";

  return (
    <div className="glass-card card-hover flex flex-col animate-slide-up" style={{ animationDelay: `${(day.day - 1) * 60}ms` }}>
      {/* Day header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground font-mono">{name}</span>
          <Badge className={cn("text-xs border", VIBE_COLORS[day.vibe] ?? VIBE_COLORS["surprise-me"])}>
            {day.vibe.replace("-", " ")}
          </Badge>
        </div>
        <div className="flex items-baseline gap-0.5">
          <span className={cn("text-base font-black", scoreCls)}>{day.viralityScore}</span>
          <span className="text-xs text-muted-foreground">/10</span>
        </div>
      </div>

      {/* Platform + format */}
      <div className="flex items-center gap-1.5 px-4 pb-2">
        <Badge className={cn("text-xs border", platformColor(day.platform))}>
          {platformLabel(day.platform)}
        </Badge>
        <Badge variant="secondary" className="text-xs">{day.format}</Badge>
      </div>

      {/* Hook */}
      <div className="px-4 pb-2">
        <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{day.hook}</p>
      </div>

      {/* Body preview */}
      <div className="px-4 pb-3 flex-1">
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{day.bodyPreview}</p>
      </div>

      {/* Hashtags */}
      <div className="px-4 pb-3">
        <div className="flex flex-wrap gap-1">
          {day.hashtags.slice(0, 4).map((h) => (
            <span key={h} className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary/70">{h}</span>
          ))}
          {day.hashtags.length > 4 && (
            <span className="text-xs text-muted-foreground">+{day.hashtags.length - 4}</span>
          )}
        </div>
      </div>

      {/* Copy */}
      <div className="px-3 pb-3">
        <button
          onClick={handleCopy}
          className="w-full h-8 rounded-lg bg-secondary border border-border flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
        >
          {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
          {copied ? "Copied!" : "Copy post"}
        </button>
      </div>
    </div>
  );
}

export default function ContentCalendarView({ calendar }: { calendar: ContentCalendar }) {
  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <Calendar className="size-5 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-bold text-foreground">{calendar.weekTheme}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            <span className="text-primary font-semibold">Quick win → </span>
            {calendar.quickWin}
          </p>
        </div>
      </div>

      {/* 7-day grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {calendar.days.map((day, i) => (
          <DayCard key={day.day} day={day} name={DAY_NAMES[i] ?? `Day ${day.day}`} />
        ))}
      </div>
    </div>
  );
}
