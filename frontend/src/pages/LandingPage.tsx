import { useNavigate } from "react-router-dom";
import { Zap, Sparkles, Brain, Timer, TrendingUp, Copy, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadLocalProfile } from "@/lib/storage";

const FEATURES = [
  {
    icon: Brain,
    title: "4-Step AI Chain",
    desc: "Research → Analyse → Generate → Score. Not one prompt — four dedicated Bedrock calls that build on each other.",
  },
  {
    icon: TrendingUp,
    title: "Virality Scoring",
    desc: "Every idea gets an honest 1–10 score with a specific reason. Know exactly why something will hit before you post it.",
  },
  {
    icon: Sparkles,
    title: "Per-Card Refining",
    desc: "One-click refine per idea: make it more viral, shorten for Reels, add a personal story, or flip it contrarian.",
  },
  {
    icon: Timer,
    title: "Pomodoro Guardrail",
    desc: "25-minute focused creation sessions with nudges that stop you planning forever and push you to actually post.",
  },
  {
    icon: Copy,
    title: "One-Click Copy",
    desc: "Hook + caption + CTA + hashtags assembled and copied instantly. Ready to paste into any platform.",
  },
  {
    icon: Zap,
    title: "Niche Memory",
    desc: "Your profile, voice, audience, and example posts are remembered across every session. No re-explaining yourself.",
  },
];

const STEPS = [
  { n: "01", title: "Set your profile", desc: "Niche, audience, voice, platforms — takes 2 minutes." },
  { n: "02", title: "Pick a vibe", desc: "Motivational, case study, quick tip, trending, or surprise me." },
  { n: "03", title: "AI runs 4 steps", desc: "Research trends → analyse your signals → generate → score." },
  { n: "04", title: "Copy & post", desc: "7 ready-to-post ideas land in your hands. Pick the best, refine, ship." },
];

const SAMPLE_CARD = {
  score: 9,
  platform: "Instagram",
  format: "Carousel",
  hook: "I trained every day for 30 days with zero equipment. Here's what actually changed 👇",
  reason: "30-day transformation + zero-barrier entry hits two massive emotional triggers: aspiration and accessibility.",
  tags: ["#noequipmentworkout", "#homefitness", "#30daychallenge", "#beginnerworkout"],
};

export default function LandingPage() {
  const navigate  = useNavigate();
  const hasProfile = !!loadLocalProfile();

  function handleCTA() {
    navigate(hasProfile ? "/generate" : "/onboarding");
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="fixed top-0 inset-x-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Zap className="size-3.5 text-primary" />
            </div>
            <span className="text-sm font-bold tracking-tight">NicheSpark</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-muted-foreground">
              Powered by Amazon Bedrock
            </span>
            <Button size="sm" onClick={handleCTA} className="gap-1.5 text-xs h-8">
              {hasProfile ? "Open app" : "Start free"}
              <ArrowRight className="size-3" />
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 px-4 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/8 rounded-full blur-3xl" />
          <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Built for the AWS Builder Challenge · Kiro + Bedrock
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
            End{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
              "What should<br className="hidden sm:block" /> I post?"
            </span>{" "}
            forever.
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto mb-8">
            NicheSpark runs a 4-step Amazon Bedrock AI chain to generate 7 ready-to-post,
            virality-scored content ideas — personalised to your niche, voice, and audience.
            In under 40 seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="xl" onClick={handleCTA} className="gap-2 btn-glow w-full sm:w-auto">
              <Sparkles className="size-5" />
              {hasProfile ? "Generate ideas now" : "Start for free — no account needed"}
            </Button>
            <span className="text-xs text-muted-foreground">
              No signup · No credit card · Local-first
            </span>
          </div>
        </div>

        {/* Sample card preview */}
        <div className="relative max-w-sm mx-auto mt-16">
          <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-3xl" />
          <div className="relative glass-card p-5 text-left">
            {/* Card header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-pink-500/10 border border-pink-500/25 text-pink-400">
                  {SAMPLE_CARD.platform}
                </span>
                <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-secondary border border-border text-muted-foreground">
                  {SAMPLE_CARD.format}
                </span>
              </div>
              <div className="flex items-baseline gap-0.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/25">
                <span className="text-base font-black score-high">{SAMPLE_CARD.score}</span>
                <span className="text-xs text-muted-foreground">/10</span>
              </div>
            </div>
            {/* Hook */}
            <p className="text-sm font-semibold text-foreground leading-snug mb-2">
              {SAMPLE_CARD.hook}
            </p>
            {/* Reason */}
            <p className="text-xs text-muted-foreground italic mb-3 leading-relaxed">
              {SAMPLE_CARD.reason}
            </p>
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_CARD.tags.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs">
                  {t}
                </span>
              ))}
            </div>
            {/* Copy button */}
            <div className="mt-3 flex gap-2">
              <div className="flex-1 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Copy className="size-3" /> Copy post
              </div>
              <div className="h-8 px-3 rounded-lg border border-border flex items-center text-xs text-muted-foreground">
                ✨ Refine
              </div>
            </div>
          </div>
          {/* Floating badges */}
          <div className="absolute -top-3 -right-3 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-lg">
            AI-generated ✓
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">How it works</p>
            <h2 className="text-2xl sm:text-3xl font-bold">From blank page to post-ready in 4 steps</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="glass-card p-5 relative">
                <span className="text-3xl font-black text-primary/20 absolute top-4 right-4 font-mono">{n}</span>
                <p className="text-sm font-bold text-foreground mb-1.5">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Features</p>
            <h2 className="text-2xl sm:text-3xl font-bold">Smarter than raw ChatGPT</h2>
            <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
              It remembers you. It researches your niche. It chains 4 AI prompts so the output is actually good.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card card-hover p-5">
                <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center mb-3">
                  <Icon className="size-4 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1.5">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── vs Raw ChatGPT ── */}
      <section className="py-20 px-4 border-t border-border/50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">Why not just use ChatGPT?</p>
            <h2 className="text-2xl font-bold">NicheSpark vs raw AI</h2>
          </div>
          <div className="glass-card overflow-hidden">
            <div className="grid grid-cols-3 text-xs font-semibold border-b border-border">
              <div className="p-3 text-muted-foreground">Feature</div>
              <div className="p-3 text-center text-primary border-x border-border">NicheSpark</div>
              <div className="p-3 text-center text-muted-foreground">Raw ChatGPT</div>
            </div>
            {[
              ["Remembers your niche & voice",  true,  false],
              ["4-step chained AI analysis",     true,  false],
              ["Virality scores with reasons",   true,  false],
              ["Per-idea refine modes",          true,  false],
              ["Trend research per session",     true,  false],
              ["Productivity timer + nudges",    true,  false],
              ["One-click copy to clipboard",    true,  true ],
              ["Powered by Amazon Bedrock",      true,  false],
            ].map(([label, ns, gpt]) => (
              <div key={String(label)} className="grid grid-cols-3 border-b border-border/50 last:border-0 text-xs">
                <div className="p-3 text-muted-foreground">{String(label)}</div>
                <div className="p-3 flex justify-center border-x border-border">
                  {ns ? <Check className="size-3.5 text-emerald-400" /> : <span className="text-muted-foreground/30">—</span>}
                </div>
                <div className="p-3 flex justify-center">
                  {gpt ? <Check className="size-3.5 text-muted-foreground" /> : <span className="text-muted-foreground/30">—</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 border-t border-border/50 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/6 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-lg mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black mb-4 leading-tight">
            Ready to stop<br />asking "what should I post?"
          </h2>
          <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
            Takes 2 minutes to set up. No account. No credit card.<br />
            Real Amazon Bedrock AI — or mock mode if you just want to explore.
          </p>
          <Button size="xl" onClick={handleCTA} className="gap-2 btn-glow">
            <Sparkles className="size-5" />
            {hasProfile ? "Back to the app" : "Get started free"}
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="size-3.5 text-primary" />
            <span className="font-medium text-foreground">NicheSpark</span>
            <span>· Built with Kiro + Amazon Bedrock</span>
          </div>
          <span>AWS Builder Challenge · July 2025</span>
        </div>
      </footer>

    </div>
  );
}
