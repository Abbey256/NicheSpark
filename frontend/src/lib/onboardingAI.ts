/**
 * onboardingAI.ts
 *
 * Background AI that runs at each onboarding step using Amazon Bedrock.
 * Falls back gracefully to pre-computed results when in mock mode.
 *
 * Step 1 → refine niche + build target avatar
 * Step 2 → predict audience pain points + objections
 * Step 3 → generate platform-specific format strategy
 * Step 4 → lock in voice system prompt
 * Step 5 → generate full 7-day content calendar
 */

import { invokeclaude } from "@/lib/bedrock";
import { getAIMode } from "@/lib/api";
import type { Platform, Vibe } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NicheRefinement {
  refined: string;           // e.g. "Calisthenics for office workers 30–45"
  avatar: string;            // 2-sentence target persona
  opportunity: string;       // Why this niche has content opportunity right now
  topAngles: string[];       // 3 content angles to lean into
}

export interface AudienceInsights {
  painPoints: string[];      // Top 3 pains
  objections: string[];      // Top 2 objections to overcome
  desiredOutcome: string;    // What they really want
  languageHints: string;     // Words/phrases they use
}

export interface PlatformStrategy {
  platform: Platform;
  bestFormat: string;
  hookStyle: string;
  optimalLength: string;
  postingTip: string;
}

export interface CalendarDay {
  day: number;               // 1–7
  vibe: Vibe;
  hook: string;
  bodyPreview: string;       // First 2 sentences of caption
  format: string;
  platform: Platform;
  hashtags: string[];
  viralityScore: number;
}

export interface ContentCalendar {
  days: CalendarDay[];
  weekTheme: string;         // e.g. "Foundation Week: Build trust and show expertise"
  quickWin: string;          // The single best post to publish TODAY
}

// ─── Mock fallbacks (used when no AWS creds) ─────────────────────────────────

function mockNicheRefinement(niche: string): NicheRefinement {
  return {
    refined: niche.length > 20 ? niche : `${niche} for busy beginners`,
    avatar: `Your ideal follower is a motivated but time-poor adult who wants results without complexity. They've tried and quit before, and they're looking for someone who gets it.`,
    opportunity: `The "${niche}" space has growing demand from people burnt out by over-complicated content. Simple, actionable advice stands out.`,
    topAngles: [
      "Quick wins that fit into a busy schedule",
      "Myth-busting the overcomplicated advice",
      "Personal transformation story with a clear lesson",
    ],
  };
}

function mockAudienceInsights(audience: string): AudienceInsights {
  return {
    painPoints: [
      "No time to create consistent content",
      "Don't know what to post that actually gets engagement",
      "Feel like their niche is too crowded",
    ],
    objections: [
      "\"I'm not an expert yet\"",
      "\"Nobody cares what I have to say\"",
    ],
    desiredOutcome: "Build a loyal audience that converts — without spending hours on content every week.",
    languageHints: "Uses words like: overwhelmed, consistent, authentic, results, just 5 minutes, real talk",
  };
}

function mockPlatformStrategies(platforms: Platform[]): PlatformStrategy[] {
  const map: Record<Platform, PlatformStrategy> = {
    instagram: { platform: "instagram", bestFormat: "Carousel (5–8 slides)", hookStyle: "Bold statement or relatable problem in slide 1", optimalLength: "150–200 word caption", postingTip: "Post between 7–9am or 6–8pm on weekdays" },
    tiktok:    { platform: "tiktok",    bestFormat: "Talking head / POV reel", hookStyle: "Spoken hook in first 3 words — use 'Stop scrolling if...'", optimalLength: "30–60 second video, caption under 100 words", postingTip: "Peak times: 6–10pm. Use trending audio" },
    linkedin:  { platform: "linkedin",  bestFormat: "Text post or Document carousel", hookStyle: "Contrarian insight or specific data point", optimalLength: "150–300 words with line breaks", postingTip: "Tuesday–Thursday 8am–10am performs best" },
    twitter:   { platform: "twitter",   bestFormat: "Thread (5–8 tweets) or single punchy take", hookStyle: "Tweet 1 must work standalone as a hook", optimalLength: "First tweet under 200 chars, thread total 400–600 words", postingTip: "Morning posts (8–10am) get the most reach" },
    youtube:   { platform: "youtube",   bestFormat: "Short (60s) or long-form tutorial", hookStyle: "First 5 seconds: tease the payoff, not the intro", optimalLength: "Shorts: 45–60s. Long form: 8–15 min for SEO", postingTip: "Upload 2–3 days before your target view day" },
  };
  return platforms.map((p) => map[p] ?? map.instagram);
}

function mockCalendar(niche: string, platforms: Platform[]): ContentCalendar {
  const p = platforms[0] ?? "instagram";
  return {
    weekTheme: "Foundation Week: Establish your authority and build audience trust",
    quickWin: `Post a 'Hot take' about a common myth in ${niche} — these get shared 3× more than educational posts.`,
    days: [
      { day: 1, vibe: "personal-story",  hook: `I was doing ${niche} completely wrong for 2 years. Here's what changed everything 👇`, bodyPreview: `It wasn't about doing more. It was about doing less, but smarter. Let me walk you through the exact shift...`, format: "Carousel", platform: p, hashtags: [`#${niche.replace(/\s+/g, "").toLowerCase()}`, "#contentcreator", "#mondaymotivation"], viralityScore: 9 },
      { day: 2, vibe: "educational",     hook: `The 3-step framework I use to [achieve result] in under 20 minutes`, bodyPreview: `Most people overcomplicate this. Here's the simplified version that actually works for beginners...`, format: "Single image", platform: p, hashtags: ["#tips", "#tutorial", "#howto"], viralityScore: 7 },
      { day: 3, vibe: "quick-tip",       hook: `One thing: stop doing [common mistake]. Do this instead.`, bodyPreview: `I see this mistake every week. The fix takes 30 seconds and the results are immediate...`, format: "Reel", platform: p, hashtags: ["#quicktip", "#hacks", "#productivity"], viralityScore: 8 },
      { day: 4, vibe: "case-study",      hook: `How [my client / I] went from [0] to [result] in 30 days with no [excuse]`, bodyPreview: `Here's the exact breakdown. Week 1 was rough — here's what happened and what we changed...`, format: "Thread", platform: p, hashtags: ["#casestudy", "#results", "#transformation"], viralityScore: 8 },
      { day: 5, vibe: "trending",        hook: `Unpopular opinion: [conventional wisdom in your niche] is actually slowing you down.`, bodyPreview: `Everyone says you need to [common advice]. Here's why I disagree and what actually moves the needle...`, format: "Talking head", platform: p, hashtags: ["#unpopularopinion", "#realtalk", "#debate"], viralityScore: 9 },
      { day: 6, vibe: "motivational",    hook: `You're not behind. You're just getting started.`, bodyPreview: `I know the comparison trap is real. But here's the truth about where 'starting late' actually puts you...`, format: "Single image", platform: p, hashtags: ["#motivation", "#mindset", "#keepgoing"], viralityScore: 7 },
      { day: 7, vibe: "educational",     hook: `Weekly roundup: 7 things I learned this week about ${niche}`, bodyPreview: `Some of these surprised even me. Sharing because I wish someone had told me this sooner...`, format: "Carousel", platform: p, hashtags: ["#weeklyreview", "#learnings", "#growth"], viralityScore: 6 },
    ],
  };
}

// ─── Real AI calls ────────────────────────────────────────────────────────────

async function aiRefineNiche(niche: string, goals: string): Promise<NicheRefinement> {
  const system = `You are a niche positioning expert for social media creators.
You help creators find hyper-specific, high-opportunity content niches.
Output ONLY valid JSON — no markdown, no preamble.`;

  const user = `Creator's raw niche: "${niche}"
Creator's goals: "${goals || "Grow audience and build authority"}"

Return a JSON object with exactly these keys:
{
  "refined": "A more specific, audience-targeted version of their niche (max 10 words)",
  "avatar": "2-sentence description of their ideal follower — who they are, what they struggle with",
  "opportunity": "1-2 sentences: why this specific niche has content opportunity right now",
  "topAngles": ["angle 1", "angle 2", "angle 3"]
}

Output ONLY the JSON object.`;

  const raw = await invokeclaude(system, user, 1024);
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return mockNicheRefinement(niche);
  return JSON.parse(match[0]) as NicheRefinement;
}

async function aiAnalyseAudience(niche: string, audienceDesc: string): Promise<AudienceInsights> {
  const system = `You are an audience psychology expert for social media.
You identify the real pains, fears, and desires of content creator audiences.
Output ONLY valid JSON — no markdown, no preamble.`;

  const user = `Niche: "${niche}"
Audience description: "${audienceDesc}"

Return a JSON object with exactly these keys:
{
  "painPoints": ["pain 1", "pain 2", "pain 3"],
  "objections": ["objection 1", "objection 2"],
  "desiredOutcome": "What they truly want (1 sentence)",
  "languageHints": "Words and phrases this audience actually uses in comments/DMs (1-2 sentences)"
}

Be specific to this niche — not generic. Output ONLY the JSON object.`;

  const raw = await invokeclaude(system, user, 1024);
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return mockAudienceInsights(audienceDesc);
  return JSON.parse(match[0]) as AudienceInsights;
}

async function aiPlatformStrategy(
  niche: string,
  platforms: Platform[],
  voiceTone: string
): Promise<PlatformStrategy[]> {
  const system = `You are a platform-specific social media strategist.
You know the exact formats, hook styles, and content lengths that perform best on each platform.
Output ONLY valid JSON — no markdown, no preamble.`;

  const user = `Niche: "${niche}"
Voice/tone: "${voiceTone}"
Platforms: ${platforms.join(", ")}

Return a JSON array, one object per platform:
[{
  "platform": "platform name",
  "bestFormat": "The #1 performing format for this niche on this platform",
  "hookStyle": "Specific hook pattern that works here",
  "optimalLength": "Optimal caption/video length",
  "postingTip": "One specific scheduling or posting insight"
}]

Output ONLY the JSON array.`;

  const raw = await invokeclaude(system, user, 1024);
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return mockPlatformStrategies(platforms);
  return JSON.parse(match[0]) as PlatformStrategy[];
}

async function aiGenerateCalendar(
  niche: string,
  audience: string,
  platforms: Platform[],
  voiceTone: string,
  examplePosts: string[],
  audienceInsights: AudienceInsights | null
): Promise<ContentCalendar> {
  const system = `You are a world-class social media content strategist.
You create 7-day content calendars that are immediately actionable.
Output ONLY valid JSON — no markdown, no preamble. All strings must be valid JSON (escape quotes).`;

  const painContext = audienceInsights
    ? `Audience pain points: ${audienceInsights.painPoints.join(", ")}`
    : "";

  const exampleContext = examplePosts.filter(Boolean).length
    ? `Creator's writing style examples:\n${examplePosts.map((p, i) => `[${i + 1}] "${p}"`).join("\n")}`
    : "";

  const user = `Create a 7-day content calendar for:
- Niche: "${niche}"
- Audience: "${audience}"
- Platforms: ${platforms.join(", ")}
- Voice/tone: "${voiceTone}"
${painContext}
${exampleContext}

Return a JSON object:
{
  "weekTheme": "A unifying theme for this 7-day sprint (e.g. 'Foundation Week: Build Trust')",
  "quickWin": "The single best post to publish TODAY and why (1 sentence)",
  "days": [
    {
      "day": 1,
      "vibe": "one of: motivational|educational|case-study|quick-tip|personal-story|trending",
      "hook": "The exact opening line — make it specific and irresistible",
      "bodyPreview": "First 2 sentences of the caption body",
      "format": "one of: Carousel|Reel|Thread|Single image|Short video|Talking head|Text post",
      "platform": "one of: ${platforms.join("|")}",
      "hashtags": ["6-8 relevant hashtags"],
      "viralityScore": 7
    }
    ... 7 total days
  ]
}

Vary the vibes and formats across the 7 days. Make hooks specific and non-generic.
Output ONLY the JSON object.`;

  const raw = await invokeclaude(system, user, 3000);
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return mockCalendar(niche, platforms);
  return JSON.parse(match[0]) as ContentCalendar;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function runStep1AI(niche: string, goals: string): Promise<NicheRefinement> {
  if (getAIMode() === "mock") return mockNicheRefinement(niche);
  try { return await aiRefineNiche(niche, goals); }
  catch { return mockNicheRefinement(niche); }
}

export async function runStep2AI(niche: string, audience: string): Promise<AudienceInsights> {
  if (getAIMode() === "mock") return mockAudienceInsights(audience);
  try { return await aiAnalyseAudience(niche, audience); }
  catch { return mockAudienceInsights(audience); }
}

export async function runStep3AI(
  niche: string, platforms: Platform[], voice: string
): Promise<PlatformStrategy[]> {
  if (getAIMode() === "mock") return mockPlatformStrategies(platforms);
  try { return await aiPlatformStrategy(niche, platforms, voice); }
  catch { return mockPlatformStrategies(platforms); }
}

export async function runStep5AI(
  niche: string,
  audience: string,
  platforms: Platform[],
  voice: string,
  examples: string[],
  insights: AudienceInsights | null
): Promise<ContentCalendar> {
  if (getAIMode() === "mock") return mockCalendar(niche, platforms);
  try { return await aiGenerateCalendar(niche, audience, platforms, voice, examples, insights); }
  catch { return mockCalendar(niche, platforms); }
}
