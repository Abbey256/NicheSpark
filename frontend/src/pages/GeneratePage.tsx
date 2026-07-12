import { useState } from "react";
import { Sparkles, RefreshCw, ChevronDown, ChevronUp, Calendar, Lightbulb } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/useToast";
import { generateIdeas, getAIMode } from "@/lib/api";
import { runStep5AI, type ContentCalendar } from "@/lib/onboardingAI";
import { saveLocalSession } from "@/lib/storage";
import { generateId, vibeLabel } from "@/lib/utils";
import type { PostIdea, Vibe, Platform } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import IdeaCard from "@/components/IdeaCard";
import VibeSelector from "@/components/VibeSelector";
import PlatformPicker from "@/components/PlatformPicker";
import PomodoroTimer from "@/components/PomodoroTimer";
import ContentCalendarView from "@/components/ContentCalendarView";
import { cn } from "@/lib/cn";

type MainTab = "ideas" | "calendar";

const STEP_LABELS = [
  { n: 1, label: "Researching trends in your niche…" },
  { n: 2, label: "Analysing virality signals for your profile…" },
  { n: 3, label: "Generating tailored ideas with Bedrock…" },
  { n: 4, label: "Scoring & refining for maximum impact…" },
];

export default function GeneratePage() {
  const { profile }  = useProfile();
  const { toast }    = useToast();
  const aiMode       = getAIMode();

  const [activeTab, setActiveTab] = useState<MainTab>("ideas");
  const [vibe, setVibe]           = useState<Vibe>("surprise-me");
  const [platforms, setPlatforms] = useState<Platform[]>(profile?.platforms ?? []);
  const [customPrompt, setCustomPrompt] = useState("");
  const [showOptions, setShowOptions]   = useState(false);

  const [ideas, setIdeas]           = useState<PostIdea[]>([]);
  const [sessionSummary, setSessionSummary] = useState("");
  const [loading, setLoading]       = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentStepLabel, setCurrentStepLabel] = useState("");

  // Calendar state
  const [calendar, setCalendar]         = useState<ContentCalendar | null>(null);
  const [calLoading, setCalLoading]     = useState(false);

  const modeLabel = aiMode === "bedrock"
    ? "🟢 Live · Amazon Bedrock"
    : aiMode === "lambda"
    ? "🟢 Live · Lambda + Bedrock"
    : "🟡 Mock mode";

  async function handleGenerate() {
    if (!profile) return;
    setLoading(true);
    setCurrentStep(0);

    try {
      const res = await generateIdeas(
        { profile, vibe, customPrompt: customPrompt.trim() || undefined,
          platforms: platforms.length > 0 ? platforms : profile.platforms, count: 7 },
        (step, label) => { setCurrentStep(step); setCurrentStepLabel(label); }
      );
      setIdeas(res.ideas);
      setSessionSummary(res.sessionSummary);
      saveLocalSession({
        sessionId: generateId(), userId: profile.userId,
        vibe, ideas: res.ideas, createdAt: new Date().toISOString(),
      });
      setActiveTab("ideas");
      toast(`${res.ideas.length} ideas generated!`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Generation failed", "error");
    } finally {
      setLoading(false);
      setCurrentStep(0);
    }
  }

  async function handleGenerateCalendar() {
    if (!profile) return;
    setCalLoading(true);
    setActiveTab("calendar");
    try {
      const cal = await runStep5AI(
        profile.niche, profile.targetAudience, profile.platforms,
        profile.voiceTone, profile.examplePosts, null
      );
      setCalendar(cal);
      toast("7-day calendar ready!");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Calendar generation failed", "error");
    } finally {
      setCalLoading(false);
    }
  }

  function handleIdeaUpdate(updated: PostIdea) {
    setIdeas((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Idea Generator</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{modeLabel}</p>
        </div>
        <PomodoroTimer />
      </div>

      {/* Main tabs */}
      <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit border border-border">
        {([
          { key: "ideas" as MainTab,    icon: Lightbulb, label: "Batch Ideas" },
          { key: "calendar" as MainTab, icon: Calendar,  label: "7-Day Calendar" },
        ]).map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all",
              activeTab === key
                ? "bg-background border border-border text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-3.5" />{label}
          </button>
        ))}
      </div>

      {/* ── BATCH IDEAS TAB ── */}
      {activeTab === "ideas" && (
        <>
          <Card className="overflow-hidden">
            <div className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">What's the vibe?</p>
              <VibeSelector value={vibe} onChange={setVibe} />
            </div>
            <div className="border-t border-border" />
            <div>
              <button
                onClick={() => setShowOptions((s) => !s)}
                className="w-full flex items-center justify-between px-5 py-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="font-medium">Additional options</span>
                {showOptions ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
              </button>
              {showOptions && (
                <div className="px-5 pb-5 space-y-4 border-t border-border pt-4 animate-fade-in">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-2">Target platforms</label>
                    <PlatformPicker value={platforms} onChange={setPlatforms} available={profile?.platforms ?? []} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-2">
                      Custom angle <span className="text-muted-foreground/50">(optional)</span>
                    </label>
                    <input
                      className="field text-sm"
                      placeholder="e.g. 'Focus on beginner mistakes' or 'Use a before/after structure'"
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-border p-4">
              <Button className="w-full h-10 text-sm gap-2" onClick={handleGenerate} disabled={loading}>
                {loading
                  ? <><RefreshCw className="size-4 animate-spin" />Running AI chain…</>
                  : <><Sparkles className="size-4" />Generate 7 Ideas</>}
              </Button>
            </div>
          </Card>

          {/* Step progress */}
          {loading && (
            <Card className="p-5 animate-fade-in">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">4-Step Bedrock Chain</p>
              <div className="space-y-3">
                {STEP_LABELS.map(({ n, label }) => {
                  const isDone = currentStep > n;
                  const isActive = currentStep === n;
                  return (
                    <div key={n} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                        {isDone   && <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center"><span className="text-emerald-400 text-xs">✓</span></div>}
                        {isActive && <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />}
                        {!isDone && !isActive && <div className="w-5 h-5 rounded-full border border-border" />}
                      </div>
                      <span className={cn("text-xs", isDone ? "text-muted-foreground line-through" : isActive ? "text-foreground font-medium" : "text-muted-foreground/40")}>
                        {isActive ? currentStepLabel : label}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground/25 font-mono">0{n}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Results */}
          {!loading && ideas.length > 0 && (
            <div className="space-y-4 animate-fade-in">
              {sessionSummary && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <Sparkles className="size-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-primary mb-1">AI Research Summary</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{sessionSummary}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{ideas.length} ideas</span>
                  <Badge variant="secondary">{vibeLabel(vibe)}</Badge>
                  <Badge variant="outline" className="text-xs">{aiMode}</Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={handleGenerate} className="text-xs h-7 gap-1">
                  <RefreshCw className="size-3" />Regenerate
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {ideas.map((idea, i) => (
                  <IdeaCard key={idea.id} idea={idea} index={i + 1} profile={profile!} onUpdate={handleIdeaUpdate} />
                ))}
              </div>
            </div>
          )}

          {!loading && ideas.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <Sparkles className="size-6 text-primary/60" />
              </div>
              <p className="text-sm font-medium">Ready to spark?</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                {aiMode === "mock"
                  ? "Mock mode active. Add AWS credentials to .env.local for real Bedrock AI."
                  : "Pick a vibe and hit Generate — real AI analysis takes ~20–40s."}
              </p>
            </div>
          )}
        </>
      )}

      {/* ── CALENDAR TAB ── */}
      {activeTab === "calendar" && (
        <>
          {!calendar && !calLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <Calendar className="size-6 text-primary/60" />
              </div>
              <p className="text-sm font-medium">Generate your 7-day content calendar</p>
              <p className="text-xs text-muted-foreground mt-1 mb-5 max-w-xs">
                The AI builds a full week of posts — hook, body, format, platform, hashtags — tuned to your niche and voice.
              </p>
              <Button onClick={handleGenerateCalendar} className="gap-2">
                <Calendar className="size-4" />
                Generate 7-Day Calendar
              </Button>
            </div>
          )}

          {calLoading && (
            <Card className="p-8 text-center animate-fade-in">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="size-5 text-primary animate-spin" />
              </div>
              <p className="text-sm font-medium text-foreground">AI building your 7-day plan…</p>
              <p className="text-xs text-muted-foreground mt-1">Tailoring hooks, formats and hashtags to your niche</p>
            </Card>
          )}

          {calendar && !calLoading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">7-Day Content Calendar</p>
                  <p className="text-xs text-muted-foreground">AI-generated for {profile?.niche}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleGenerateCalendar} className="text-xs h-7 gap-1">
                  <RefreshCw className="size-3" />Regenerate
                </Button>
              </div>
              <ContentCalendarView calendar={calendar} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
