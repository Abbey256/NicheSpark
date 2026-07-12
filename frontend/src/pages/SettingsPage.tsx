import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Save, LogOut, User, Target, Mic, Monitor } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/useToast";
import { clearLocalData } from "@/lib/storage";
import { generateId } from "@/lib/utils";
import type { Platform } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import PlatformPicker from "@/components/PlatformPicker";

const TONE_OPTIONS = [
  "Casual and relatable",
  "Professional and authoritative",
  "Motivational and energetic",
  "Educational and clear",
  "Witty and humorous",
  "Storytelling and emotional",
];

export default function SettingsPage() {
  const { profile, setProfile, clearProfile } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: profile?.name ?? "",
    niche: profile?.niche ?? "",
    targetAudience: profile?.targetAudience ?? "",
    platforms: (profile?.platforms ?? []) as Platform[],
    voiceTone: profile?.voiceTone ?? "",
    examplePost1: profile?.examplePosts?.[0] ?? "",
    examplePost2: profile?.examplePosts?.[1] ?? "",
    goals: profile?.goals ?? "",
  });

  function update<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function handleSave() {
    const now = new Date().toISOString();
    setProfile({
      userId: profile?.userId ?? generateId(),
      name: form.name.trim(),
      niche: form.niche.trim(),
      targetAudience: form.targetAudience.trim(),
      platforms: form.platforms,
      voiceTone: form.voiceTone,
      examplePosts: [form.examplePost1, form.examplePost2].map((s) => s.trim()).filter(Boolean),
      goals: form.goals.trim(),
      createdAt: profile?.createdAt ?? now,
      updatedAt: now,
    });
    toast("Profile saved");
  }

  function handleReset() {
    clearLocalData();
    clearProfile();
    navigate("/onboarding");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      <div className="flex items-center gap-2">
        <Settings className="size-4 text-muted-foreground" />
        <div>
          <h1 className="text-lg font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">Edit your creator profile</p>
        </div>
      </div>

      {/* Identity */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="size-3.5 text-muted-foreground" />
            <CardTitle>Identity</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Your name</label>
            <Input placeholder="Alex Rivera" value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Content niche</label>
            <Input placeholder="e.g. Calisthenics for office workers" value={form.niche} onChange={(e) => update("niche", e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Goal</label>
            <Input placeholder="e.g. Grow to 10k, launch a course" value={form.goals} onChange={(e) => update("goals", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Audience */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="size-3.5 text-muted-foreground" />
            <CardTitle>Audience</CardTitle>
          </div>
          <CardDescription>Who you're creating for</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g. 25–35 year olds who want to get fit but have no time. They love quick wins and hate complicated plans."
            className="min-h-[90px]"
            value={form.targetAudience}
            onChange={(e) => update("targetAudience", e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Voice & Platforms */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mic className="size-3.5 text-muted-foreground" />
            <CardTitle>Voice & Platforms</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">Brand voice</label>
            <div className="grid grid-cols-2 gap-2">
              {TONE_OPTIONS.map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => update("voiceTone", tone)}
                  className={`text-left px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                    form.voiceTone === tone
                      ? "bg-primary/15 border-primary/40 text-primary"
                      : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-2">Platforms</label>
            <PlatformPicker value={form.platforms} onChange={(p) => update("platforms", p)} available={[]} />
          </div>
        </CardContent>
      </Card>

      {/* Example posts */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Monitor className="size-3.5 text-muted-foreground" />
            <CardTitle>Example winning posts</CardTitle>
          </div>
          <CardDescription>The AI learns your style from these</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea placeholder="Best post #1 (paste your caption)" className="min-h-[70px] text-xs" value={form.examplePost1} onChange={(e) => update("examplePost1", e.target.value)} />
          <Textarea placeholder="Best post #2 (optional)" className="min-h-[70px] text-xs" value={form.examplePost2} onChange={(e) => update("examplePost2", e.target.value)} />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5 text-xs" onClick={handleReset}>
          <LogOut className="size-3.5" />
          Reset & restart onboarding
        </Button>
        <Button onClick={handleSave} className="gap-1.5 text-sm">
          <Save className="size-4" />
          Save profile
        </Button>
      </div>
    </div>
  );
}
