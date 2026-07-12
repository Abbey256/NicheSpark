import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, ArrowRight, ArrowLeft, Check, Sparkles, Loader2, Target, Monitor, Mic } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { saveLocalSession } from "@/lib/storage";
import { generateId } from "@/lib/utils";
import { getAIMode } from "@/lib/api";
import {
  runStep1AI, runStep2AI, runStep3AI, runStep5AI,
  type NicheRefinement, type AudienceInsights,
  type PlatformStrategy, type ContentCalendar,
} from "@/lib/onboardingAI";
import type { CreatorProfile, Platform, Vibe } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/cn";

// ─── Platforms & tones ───────────────────────────────────────────────────────
const PLATFORMS: { value: Platform; label: string; icon: string }[] = [
  { value: "instagram", label: "Instagram", icon: "📸" },
  { value: "tiktok",    label: "TikTok",    icon: "🎵" },
  { value: "linkedin",  label: "LinkedIn",  icon: "💼" },
  { value: "twitter",   label: "Twitter / X", icon: "𝕏" },
  { value: "youtube",   label: "YouTube",   icon: "▶" },
];
const TONES = [
  "Casual and relatable",
  "Professional and authoritative",
  "Motivational and energetic",
  "Educational and clear",
  "Witty and humorous",
  "Storytelling and emotional",
];

// ─── Step config ─────────────────────────────────────────────────────────────
const STEPS = [
  { num: 1, label: "Profile",   icon: Zap,     title: "Let's set up your spark",          subtitle: "Tell us your niche and goal — the AI starts working immediately." },
  { num: 2, label: "Audience",  icon: Target,  title: "Who do you create for?",           subtitle: "The AI will map their pain points and objections automatically." },
  { num: 3, label: "Platforms", icon: Monitor, title: "Where do you post?",               subtitle: "The AI will tailor format, length, and hook style per platform." },
  { num: 4, label: "Voice",     icon: Mic,     title: "What's your brand voice?",         subtitle: "Your tone becomes the AI's writing style for every generated post." },
  { num: 5, label: "Examples",  icon: Sparkles,title: "The magic step ✨",                subtitle: "Paste one past post and the AI generates your full 7-day content calendar." },
];

// ─── Small reusable pieces ───────────────────────────────────────────────────

function AIInsightBox({ loading, children, icon = "🧠" }: {
  loading: boolean; children: React.ReactNode; icon?: string;
}) {
  if (loading) {
    return (
      <div className="mt-4 p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3 animate-fade-in">
        <Loader2 className="size-4 text-primary animate-spin shrink-0" />
        <p className="text-xs text-primary/80 font-medium">AI is analysing…</p>
      </div>
    );
  }
  if (!children) return null;
  return (
    <div className="mt-4 p-3.5 rounded-xl bg-primary/5 border border-primary/20 animate-fade-in">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-semibold text-primary">AI Insight</span>
      </div>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const { setProfile } = useProfile();
  const navigate = useNavigate();
  const aiMode = getAIMode();

  const [step, setStep] = useState(0);
  const [finishing, setFinishing] = useState(false);

  // Form values
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [goals, setGoals] = useState("");
  const [audience, setAudience] = useState("");
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [voiceTone, setVoiceTone] = useState("");
  const [example1, setExample1] = useState("");
  const [example2, setExample2] = useState("");

  // AI results per step
  const [step1AI, setStep1AI] = useState<NicheRefinement | null>(null);
  const [step1Loading, setStep1Loading] = useState(false);
  const [step2AI, setStep2AI] = useState<AudienceInsights | null>(null);
  const [step2Loading, setStep2Loading] = useState(false);
  const [step3AI, setStep3AI] = useState<PlatformStrategy[]>([]);
  const [step3Loading, setStep3Loading] = useState(false);
  const [calendar, setCalendar] = useState<ContentCalendar | null>(null);

  // Debounce niche input for live AI preview
  const nicheDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (niche.trim().length < 5) return;
    if (nicheDebounce.current) clearTimeout(nicheDebounce.current);
    nicheDebounce.current = setTimeout(async () => {
      if (step === 0) {
        setStep1Loading(true);
        const res = await runStep1AI(niche.trim(), goals.trim());
        setStep1AI(res);
        setStep1Loading(false);
      }
    }, 900);
    return () => { if (nicheDebounce.current) clearTimeout(nicheDebounce.current); };
  }, [niche, goals, step]);

  // Validate per step
  const canAdvance = [
    name.trim() && niche.trim().length >= 5,
    audience.trim().length >= 10,
    platforms.length > 0,
    !!voiceTone,
    example1.trim().length >= 10,
  ][step];

  function togglePlatform(p: Platform) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  // Run background AI when advancing to next step
  async function handleAdvance() {
    if (step === 1 && !step2AI) {
      setStep2Loading(true);
      setStep(2);
      const res = await runStep2AI(niche, audience);
      setStep2AI(res);
      setStep2Loading(false);
      return;
    }
    if (step === 2 && platforms.length > 0) {
      setStep3Loading(true);
      setStep(3);
      const res = await runStep3AI(niche, platforms, voiceTone || "casual");
      setStep3AI(res);
      setStep3Loading(false);
      return;
    }
    setStep((s) => s + 1);
  }

  // Final step — generate calendar + save profile + navigate
  async function handleFinish() {
    setFinishing(true);
    const now = new Date().toISOString();
    const userId = generateId();

    const profile: CreatorProfile = {
      userId,
      name: name.trim(),
      niche: step1AI?.refined ?? niche.trim(),
      targetAudience: audience.trim(),
      platforms,
      voiceTone,
      examplePosts: [example1, example2].map((s) => s.trim()).filter(Boolean),
      goals: goals.trim(),
      createdAt: now,
      updatedAt: now,
    };

    setProfile(profile);

    // Generate the 7-day calendar
    const cal = await runStep5AI(
      profile.niche,
      profile.targetAudience,
      profile.platforms,
      profile.voiceTone,
      profile.examplePosts,
      step2AI
    );
    setCalendar(cal);

    // Save calendar as first session
    saveLocalSession({
      sessionId: generateId(),
      userId,
      vibe: "surprise-me" as Vibe,
      ideas: cal.days.map((d) => ({
        id: generateId(),
        hook: d.hook,
        caption: d.bodyPreview + "\n\n[Full caption in app]",
        visualDescription: `${d.format} post for ${d.platform}`,
        viralityScore: d.viralityScore,
        viralityReason: `Day ${d.day} · ${d.vibe} · ${d.format}`,
        hashtags: d.hashtags,
        cta: "Follow for more",
        platform: d.platform,
        format: d.format,
        createdAt: now,
      })),
      createdAt: now,
    });

    setFinishing(false);
    navigate("/app/generate");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/6 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Logo + mode badge */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Zap className="size-4 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">NicheSpark</span>
          </div>

          {/* AI mode pill */}
          <div className="flex justify-center mb-4">
            <div className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium",
              aiMode !== "mock"
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                : "bg-amber-500/10 border-amber-500/25 text-amber-400"
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full", aiMode !== "mock" ? "bg-emerald-400 animate-pulse" : "bg-amber-400")} />
              {aiMode !== "mock" ? "Live Amazon Bedrock AI" : "Mock mode — AI previews simulated"}
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-0">
            {STEPS.map(({ num, label }, i) => {
              const isDone   = i < step;
              const isActive = i === step;
              return (
                <div key={num} className="flex items-center">
                  <div className="flex flex-col items-center gap-0.5 px-1.5">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200",
                      isDone   ? "bg-primary text-primary-foreground" :
                      isActive ? "bg-primary/20 border-2 border-primary text-primary" :
                                 "bg-secondary border border-border text-muted-foreground/40"
                    )}>
                      {isDone ? <Check className="size-3" /> : num}
                    </div>
                    <span className={cn(
                      "text-[9px] font-medium hidden sm:block leading-none",
                      isActive ? "text-primary" : "text-muted-foreground/40"
                    )}>{label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn("h-px w-5 transition-all duration-300", i < step ? "bg-primary" : "bg-border")} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Card */}
        <div className="glass-card p-6 animate-slide-up">
          {/* Step header */}
          <div className="flex items-start gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
              {(() => { const Icon = STEPS[step].icon; return <Icon className="size-4 text-primary" />; })()}
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground leading-tight">{STEPS[step].title}</h2>
              <p className="text-xs text-foreground/55 mt-0.5 leading-relaxed">{STEPS[step].subtitle}</p>
            </div>
          </div>

          {/* ── STEP 0: Profile ── */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground/75 block mb-1.5">Your name</label>
                <Input placeholder="e.g. Alex Rivera" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-foreground/75">Content niche</label>
                  {step1Loading && (
                    <span className="flex items-center gap-1 text-xs text-primary">
                      <Loader2 className="size-3 animate-spin" /> AI analysing…
                    </span>
                  )}
                  {step1AI && !step1Loading && (
                    <span className="flex items-center gap-1 text-xs text-emerald-400">
                      <Check className="size-3" /> AI ready
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    placeholder="e.g. Calisthenics for office workers"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                  />
                  {/* Suggest refined niche */}
                  {step1AI && step1AI.refined !== niche && !step1Loading && (
                    <button
                      onClick={() => setNiche(step1AI.refined)}
                      className="mt-1.5 flex items-center gap-1.5 text-xs text-primary hover:underline"
                    >
                      <Sparkles className="size-3" />
                      AI suggests: <span className="font-semibold">"{step1AI.refined}"</span> — use this?
                    </button>
                  )}
                </div>
                <p className="text-xs text-foreground/45 mt-1.5 leading-relaxed">
                  💡 Be specific — <span className="text-foreground/65">"fitness"</span> → <span className="text-foreground/65">"calisthenics for office workers 30–45"</span>
                </p>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground/75 block mb-1.5">
                  Content goal <span className="text-foreground/35 font-normal">(optional)</span>
                </label>
                <Input placeholder="e.g. Grow to 10k, sell my course" value={goals} onChange={(e) => setGoals(e.target.value)} />
              </div>

              {/* Live AI preview box */}
              <AIInsightBox loading={step1Loading} icon="🎯">
                {step1AI && (
                  <div className="space-y-2.5">
                    <div>
                      <p className="text-xs font-semibold text-foreground/70 mb-0.5">Target avatar</p>
                      <p className="text-xs text-foreground/60 leading-relaxed">{step1AI.avatar}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground/70 mb-0.5">Opportunity</p>
                      <p className="text-xs text-foreground/60 leading-relaxed">{step1AI.opportunity}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground/70 mb-1">Top content angles</p>
                      <div className="space-y-1">
                        {step1AI.topAngles.map((a, i) => (
                          <div key={i} className="flex items-start gap-1.5">
                            <span className="text-primary text-xs mt-0.5">→</span>
                            <p className="text-xs text-foreground/60">{a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </AIInsightBox>
            </div>
          )}

          {/* ── STEP 1: Audience ── */}
          {step === 1 && (
            <div>
              <label className="text-xs font-semibold text-foreground/75 block mb-1.5">Describe your ideal follower</label>
              <Textarea
                className="min-h-[110px]"
                placeholder="e.g. 25–35 year olds who want to get fit but have no time. Love quick wins, hate complicated plans. Struggle with staying consistent."
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
              <p className="text-xs text-foreground/45 mt-1.5 leading-relaxed">
                💡 Include age, pain points, and what they're trying to achieve. The AI maps their psychology from this.
              </p>

              {step2AI && (
                <AIInsightBox loading={false} icon="🧠">
                  <div className="space-y-2.5">
                    <div>
                      <p className="text-xs font-semibold text-foreground/70 mb-1">Pain points the AI detected</p>
                      {step2AI.painPoints.map((p, i) => (
                        <div key={i} className="flex items-start gap-1.5 mb-0.5">
                          <span className="text-red-400 text-xs">•</span>
                          <p className="text-xs text-foreground/60">{p}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground/70 mb-1">Objections to overcome</p>
                      {step2AI.objections.map((o, i) => (
                        <div key={i} className="flex items-start gap-1.5 mb-0.5">
                          <span className="text-amber-400 text-xs">→</span>
                          <p className="text-xs text-foreground/60 italic">{o}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground/70 mb-0.5">What they truly want</p>
                      <p className="text-xs text-primary/80 font-medium">{step2AI.desiredOutcome}</p>
                    </div>
                  </div>
                </AIInsightBox>
              )}

              {step2Loading && <AIInsightBox loading icon="🧠">{null}</AIInsightBox>}
            </div>
          )}

          {/* ── STEP 2: Platforms ── */}
          {step === 2 && (
            <div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {PLATFORMS.map(({ value, label, icon }) => {
                  const sel = platforms.includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => togglePlatform(value)}
                      className={cn(
                        "flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-sm font-medium transition-all text-left",
                        sel
                          ? "bg-primary/15 border-primary/40 text-foreground"
                          : "bg-secondary border-border text-foreground/55 hover:text-foreground"
                      )}
                    >
                      <span className="text-base">{icon}</span>
                      <span className="text-sm">{label}</span>
                      {sel && <Check className="size-3.5 ml-auto text-primary" />}
                    </button>
                  );
                })}
              </div>

              {/* Platform strategies */}
              {step3Loading && <AIInsightBox loading icon="📱">{null}</AIInsightBox>}
              {step3AI.length > 0 && !step3Loading && (
                <AIInsightBox loading={false} icon="📱">
                  <div className="space-y-3">
                    {step3AI.map((s) => (
                      <div key={s.platform} className="pb-2.5 border-b border-border/40 last:border-0 last:pb-0">
                        <p className="text-xs font-semibold text-foreground/80 capitalize mb-1">{s.platform}</p>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                          <p className="text-xs text-foreground/50"><span className="text-foreground/65 font-medium">Format:</span> {s.bestFormat}</p>
                          <p className="text-xs text-foreground/50"><span className="text-foreground/65 font-medium">Length:</span> {s.optimalLength}</p>
                        </div>
                        <p className="text-xs text-primary/70 mt-0.5">{s.hookStyle}</p>
                      </div>
                    ))}
                  </div>
                </AIInsightBox>
              )}
            </div>
          )}

          {/* ── STEP 3: Voice ── */}
          {step === 3 && (
            <div className="space-y-2">
              {TONES.map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => setVoiceTone(tone)}
                  className={cn(
                    "w-full text-left px-4 py-2.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-between",
                    voiceTone === tone
                      ? "bg-primary/15 border-primary/40 text-foreground"
                      : "bg-secondary border-border text-foreground/55 hover:text-foreground"
                  )}
                >
                  {tone}
                  {voiceTone === tone && <Check className="size-4 text-primary shrink-0" />}
                </button>
              ))}
              {voiceTone && (
                <div className="mt-3 px-3.5 py-3 rounded-xl bg-primary/5 border border-primary/20 animate-fade-in">
                  <p className="text-xs text-primary/80">
                    <span className="font-semibold">AI writing style locked:</span> Every generated post will use a <span className="italic">{voiceTone.toLowerCase()}</span> voice — applied automatically to all captions, hooks, and CTAs.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 4: Examples + Calendar ── */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground/75 block mb-1.5">Your best post *</label>
                <Textarea
                  className="min-h-[80px] text-xs"
                  placeholder="Paste a caption you're proud of — or one that performed well…"
                  value={example1}
                  onChange={(e) => setExample1(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground/75 block mb-1.5">
                  Second example <span className="text-foreground/35 font-normal">(optional)</span>
                </label>
                <Textarea
                  className="min-h-[60px] text-xs"
                  placeholder="Another post the AI can learn from…"
                  value={example2}
                  onChange={(e) => setExample2(e.target.value)}
                />
              </div>
              <p className="text-xs text-foreground/45 leading-relaxed">
                💡 The AI uses these to clone your writing style — not copy them. One post is enough to learn your voice.
              </p>

              {/* What happens next */}
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                <p className="text-xs font-semibold text-primary mb-2">✨ What happens when you click "Generate"</p>
                <div className="space-y-1.5">
                  {[
                    "AI researches trending content in your niche",
                    "Analyses your audience's pain points",
                    "Applies your voice and platform formats",
                    "Generates a full 7-day content calendar",
                    "Scores every idea for virality",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-primary text-[9px] font-bold">{i + 1}</span>
                      </div>
                      <p className="text-xs text-foreground/60">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            {step > 0 ? (
              <Button variant="ghost" size="sm" onClick={() => setStep((s) => s - 1)} disabled={finishing}>
                <ArrowLeft className="size-3.5" /> Back
              </Button>
            ) : <div />}

            {step < STEPS.length - 1 ? (
              <Button disabled={!canAdvance} onClick={handleAdvance}>
                Continue <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button disabled={!canAdvance || finishing} onClick={handleFinish} className="gap-2">
                {finishing ? (
                  <><Loader2 className="size-4 animate-spin" />AI generating calendar…</>
                ) : (
                  <><Sparkles className="size-4" />Generate my 7-day plan</>
                )}
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-foreground/40 mt-4">
          No account needed · Data stays in your browser
        </p>
      </div>
    </div>
  );
}
