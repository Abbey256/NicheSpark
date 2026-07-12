import { useMemo } from "react";
import { Flame, Lightbulb, CalendarDays, Zap, TrendingUp } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { loadLocalSessions } from "@/lib/storage";
import { formatDate, vibeLabel } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function StatCard({ icon: Icon, label, value, sub, accent = false }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; accent?: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accent ? "bg-primary/15" : "bg-secondary"}`}>
          <Icon className={`size-3.5 ${accent ? "text-primary" : "text-muted-foreground"}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </Card>
  );
}

export default function DashboardPage() {
  const { profile } = useProfile();
  const sessions = useMemo(() => loadLocalSessions(), []);

  const totalIdeas = sessions.reduce((s, sess) => s + sess.ideas.length, 0);
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const ideasThisWeek = sessions
    .filter((s) => new Date(s.createdAt).getTime() > oneWeekAgo)
    .reduce((s, sess) => s + sess.ideas.length, 0);

  const streak = useMemo(() => {
    if (!sessions.length) return 0;
    const days = new Set(sessions.map((s) => s.createdAt.split("T")[0]));
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (days.has(d.toISOString().split("T")[0])) count++;
      else break;
    }
    return count;
  }, [sessions]);

  const bestIdea = useMemo(() => {
    const all = sessions.flatMap((s) => s.ideas);
    if (!all.length) return null;
    return all.reduce((best, idea) => idea.viralityScore > best.viralityScore ? idea : best);
  }, [sessions]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Your content creation overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Lightbulb} label="Total ideas" value={totalIdeas} sub="all time" accent />
        <StatCard icon={CalendarDays} label="This week" value={ideasThisWeek} sub="ideas" />
        <StatCard icon={Flame} label="Streak" value={`${streak}d`} sub={streak > 0 ? "Keep going!" : "Start today"} accent={streak > 0} />
        <StatCard icon={Zap} label="Sessions" value={sessions.length} sub="total" />
      </div>

      {/* Best idea */}
      {bestIdea && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="size-3.5 text-primary" />
              <CardTitle>Highest scoring idea</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                <span className="text-lg font-black text-primary leading-none">{bestIdea.viralityScore}</span>
                <span className="text-xs text-muted-foreground">/10</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{bestIdea.hook}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{bestIdea.caption}</p>
                <p className="text-xs text-primary/70 mt-1.5 italic">{bestIdea.viralityReason}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile summary */}
      {profile && (
        <Card>
          <CardHeader>
            <CardTitle>Creator Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {[
                { label: "Niche", value: profile.niche },
                { label: "Voice", value: profile.voiceTone },
                { label: "Audience", value: profile.targetAudience },
                { label: "Platforms", value: profile.platforms.join(", ") },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="text-sm text-foreground font-medium">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent sessions */}
      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Recent sessions</h2>
        {sessions.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="text-3xl mb-3">🪄</p>
            <p className="text-sm text-muted-foreground">No sessions yet — generate your first batch!</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {sessions.slice(0, 8).map((s) => (
              <div key={s.sessionId} className="glass-card flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Sparkles className="size-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{vibeLabel(s.vibe)} batch</p>
                  <p className="text-xs text-muted-foreground">{s.ideas.length} ideas · {formatDate(s.createdAt)}</p>
                </div>
                <Badge variant="secondary" className="text-xs shrink-0">
                  Best: {Math.max(...s.ideas.map((i) => i.viralityScore))}/10
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
        <p className="text-xs font-semibold text-primary mb-1">💡 Pro tip</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The best creators batch in focused 20-min blocks. Generate, pick your top 3, draft them — before closing this tab. Tomorrow-you will thank you.
        </p>
      </div>
    </div>
  );
}

// Local import fix
function Sparkles({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  );
}
