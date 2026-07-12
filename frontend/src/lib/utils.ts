import type { Platform, Vibe } from "@/types";

export function vibeLabel(vibe: Vibe): string {
  const map: Record<Vibe, string> = {
    motivational: "🔥 Motivational",
    educational: "🎓 Educational",
    "case-study": "📊 Case Study",
    "quick-tip": "⚡ Quick Tip",
    "personal-story": "💬 Personal Story",
    trending: "📈 Trending",
    "surprise-me": "✨ Surprise Me",
  };
  return map[vibe];
}

export function platformLabel(p: Platform): string {
  const map: Record<Platform, string> = {
    instagram: "Instagram",
    tiktok: "TikTok",
    linkedin: "LinkedIn",
    twitter: "Twitter / X",
    youtube: "YouTube",
  };
  return map[p];
}

export function platformColor(p: Platform): string {
  const map: Record<Platform, string> = {
    instagram: "border-pink-500/30 bg-pink-500/10 text-pink-400",
    tiktok: "border-slate-500/30 bg-slate-500/10 text-slate-300",
    linkedin: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    twitter: "border-sky-500/30 bg-sky-500/10 text-sky-400",
    youtube: "border-red-500/30 bg-red-500/10 text-red-400",
  };
  return map[p];
}

export function scoreColor(score: number): string {
  if (score >= 8) return "text-green-600";
  if (score >= 6) return "text-yellow-600";
  return "text-red-500";
}

export function scoreBg(score: number): string {
  if (score >= 8) return "bg-green-50 border-green-200";
  if (score >= 6) return "bg-yellow-50 border-yellow-200";
  return "bg-red-50 border-red-200";
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Copy text to clipboard, returns success boolean */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
