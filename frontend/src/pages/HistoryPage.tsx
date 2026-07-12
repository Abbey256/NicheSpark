import { useMemo, useState } from "react";
import { Clock, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { loadLocalSessions } from "@/lib/storage";
import { formatDate, vibeLabel, platformLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IdeaSession } from "@/types";

function SessionRow({ session }: { session: IdeaSession }) {
  const [open, setOpen] = useState(false);
  const best = Math.max(...session.ideas.map((i) => i.viralityScore));

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/30 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Sparkles className="size-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{vibeLabel(session.vibe)} batch</p>
          <p className="text-xs text-muted-foreground">{session.ideas.length} ideas · {formatDate(session.createdAt)}</p>
        </div>
        <Badge variant="secondary" className="text-xs">Best {best}/10</Badge>
        {open ? <ChevronUp className="size-3.5 text-muted-foreground" /> : <ChevronDown className="size-3.5 text-muted-foreground" />}
      </button>

      {open && (
        <div className="border-t border-border px-4 py-3 space-y-2.5 animate-fade-in">
          {session.ideas.map((idea, i) => (
            <div key={idea.id} className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
              <div className="flex flex-col items-center w-8 shrink-0 mt-0.5">
                <span className={`text-sm font-black leading-none ${idea.viralityScore >= 8 ? "text-emerald-400" : idea.viralityScore >= 6 ? "text-amber-400" : "text-red-400"}`}>
                  {idea.viralityScore}
                </span>
                <span className="text-xs text-muted-foreground">/10</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground mb-0.5">{idea.hook}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{platformLabel(idea.platform)}</Badge>
                  <Badge variant="secondary" className="text-xs">{idea.format}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  const sessions = useMemo(() => loadLocalSessions(), []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-center gap-2">
        <Clock className="size-4 text-muted-foreground" />
        <div>
          <h1 className="text-lg font-semibold">History</h1>
          <p className="text-sm text-muted-foreground">{sessions.length} sessions saved locally</p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <Card className="p-12 text-center">
          <Clock className="size-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No history yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Your generations will appear here</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => <SessionRow key={s.sessionId} session={s} />)}
        </div>
      )}
    </div>
  );
}
