import { useState } from "react";
import { Copy, Check, ChevronDown, ChevronUp, Wand2, Loader2 } from "lucide-react";
import type { PostIdea } from "@/types";
import type { CreatorProfile } from "@/types";
import { platformLabel, platformColor, copyToClipboard } from "@/lib/utils";
import { refineIdea, type RefineMode } from "@/lib/aiChain";
import { getAIMode } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

interface Props {
  idea: PostIdea;
  index: number;
  profile: CreatorProfile;
  onUpdate: (updated: PostIdea) => void;
}

type Tab = "caption" | "visual" | "hashtags";

const REFINE_OPTIONS: { mode: RefineMode; label: string; icon: string }[] = [
  { mode: "more-viral",   label: "Make more viral",     icon: "🚀" },
  { mode: "shorten-reels",label: "Shorten for Reels",   icon: "📱" },
  { mode: "add-story",    label: "Add personal story",  icon: "💬" },
  { mode: "professional", label: "Make professional",   icon: "💼" },
  { mode: "contrarian",   label: "Contrarian angle",    icon: "🔥" },
];

function ScorePill({ score }: { score: number }) {
  const textCls = score >= 8 ? "score-high" : score >= 6 ? "score-mid" : "score-low";
  const bgCls   = score >= 8
    ? "bg-emerald-500/10 border-emerald-500/25"
    : score >= 6
    ? "bg-amber-500/10 border-amber-500/25"
    : "bg-red-500/10 border-red-500/25";

  return (
    <div className={cn("flex items-baseline gap-0.5 px-2 py-1 rounded-md border", bgCls)}>
      <span className={cn("text-base font-black leading-none", textCls)}>{score}</span>
      <span className="text-xs text-muted-foreground">/10</span>
    </div>
  );
}

export default function IdeaCard({ idea, index, profile, onUpdate }: Props) {
  const { toast }        = useToast();
  const aiMode           = getAIMode();
  const [tab, setTab]    = useState<Tab>("caption");
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [refining, setRefining] = useState(false);
  const [showRefineMenu, setShowRefineMenu] = useState(false);

  async function handleCopy() {
    const text = [idea.hook, "", idea.caption, "", idea.cta, "", idea.hashtags.join(" ")].join("\n");
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      toast("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleRefine(mode: RefineMode) {
    setShowRefineMenu(false);
    if (aiMode === "mock") {
      toast("Refine needs real AWS credentials — add them to .env.local", "info");
      return;
    }
    setRefining(true);
    try {
      const refined = await refineIdea(idea, mode, profile);
      onUpdate(refined);
      toast("Idea refined! ✨");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Refine failed", "error");
    } finally {
      setRefining(false);
    }
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: "caption",  label: "Caption"  },
    { key: "visual",   label: "Visual"   },
    { key: "hashtags", label: "Tags"     },
  ];

  return (
    <div
      className="glass-card card-hover flex flex-col animate-slide-up"
      style={{ animationDelay: `${(index - 1) * 50}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 p-4 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-mono">#{index}</span>
          <Badge className={cn("text-xs border", platformColor(idea.platform))}>
            {platformLabel(idea.platform)}
          </Badge>
          <Badge variant="secondary" className="text-xs">{idea.format}</Badge>
        </div>
        <ScorePill score={idea.viralityScore} />
      </div>

      {/* Hook */}
      <div className="px-4 pb-1.5">
        <p className="text-sm font-semibold text-foreground leading-snug">{idea.hook}</p>
      </div>

      {/* Virality reason */}
      <div className="px-4 pb-3">
        <p className="text-xs text-muted-foreground/70 italic leading-relaxed">
          {idea.viralityReason}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-t border-border">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex-1 py-2 text-xs font-medium transition-colors",
              tab === key
                ? "text-primary border-b-2 border-primary bg-primary/5"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-4 py-3 flex-1 min-h-[96px] text-xs text-muted-foreground leading-relaxed">
        {tab === "caption" && (
          <div>
            <p className={cn("whitespace-pre-line", !expanded && "line-clamp-4")}>
              {idea.caption}
            </p>
            {idea.caption.length > 160 && (
              <button
                onClick={() => setExpanded((e) => !e)}
                className="mt-1.5 flex items-center gap-1 text-primary text-xs hover:underline"
              >
                {expanded ? <><ChevronUp className="size-3" />Less</> : <><ChevronDown className="size-3" />More</>}
              </button>
            )}
            {idea.cta && (
              <p className="mt-2 text-xs font-semibold text-primary">→ {idea.cta}</p>
            )}
          </div>
        )}
        {tab === "visual" && (
          <p className="italic">{idea.visualDescription}</p>
        )}
        {tab === "hashtags" && (
          <div className="flex flex-wrap gap-1.5">
            {idea.hashtags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex gap-2 p-3 pt-0 relative">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 text-xs h-8"
          onClick={handleCopy}
        >
          {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
          {copied ? "Copied!" : "Copy post"}
        </Button>

        {/* Refine dropdown */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-2.5 text-xs gap-1.5"
            onClick={() => setShowRefineMenu((s) => !s)}
            disabled={refining}
            title="Refine with AI"
          >
            {refining
              ? <Loader2 className="size-3.5 animate-spin" />
              : <Wand2 className="size-3.5" />}
            {refining ? "Refining…" : "Refine"}
          </Button>

          {showRefineMenu && !refining && (
            <div className="absolute bottom-full right-0 mb-1.5 w-48 glass-card border border-border rounded-xl overflow-hidden shadow-xl z-20 animate-fade-in">
              {REFINE_OPTIONS.map(({ mode, label, icon }) => (
                <button
                  key={mode}
                  onClick={() => handleRefine(mode)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors text-left"
                >
                  <span>{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
