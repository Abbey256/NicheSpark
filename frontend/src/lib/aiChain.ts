/**
 * aiChain.ts — 4-step AI chain running on Amazon Bedrock (Claude).
 *
 * Step 1 · RESEARCH   — What's trending + evergreen in this niche right now?
 * Step 2 · ANALYZE    — Extract virality signals from the profile + research.
 * Step 3 · GENERATE   — Produce raw batch of N post ideas.
 * Step 4 · SCORE      — Self-critique each idea, assign virality score + reason.
 *
 * Each step feeds into the next, giving far richer output than a single prompt.
 */

import { invokeclaude } from "@/lib/bedrock";
import type {
  CreatorProfile,
  GenerateIdeasRequest,
  GenerateIdeasResponse,
  PostIdea,
  Platform,
  Vibe,
} from "@/types";
import { generateId } from "@/lib/utils";

// ─── Step progress callback so the UI can show which step is running ──────────
export type StepCallback = (step: 1 | 2 | 3 | 4, label: string) => void;

// ─── Step 1: Niche Research ───────────────────────────────────────────────────
async function researchNiche(
  profile: CreatorProfile,
  vibe: Vibe
): Promise<string> {
  const system = `You are a social media trend analyst with deep expertise in content virality.
You research what content formats, topics, and angles are working RIGHT NOW across platforms.
Be specific, data-driven, and concise. Output plain paragraphs only — no markdown headers or bullet symbols.`;

  const user = `Research assignment:
Niche: "${profile.niche}"
Target audience: "${profile.targetAudience}"
Platforms: ${profile.platforms.join(", ")}
Content vibe requested: "${vibe}"

Provide a focused research brief (150–200 words) covering:
1. What content formats in this niche are getting the most engagement right now
2. What emotional triggers resonate most with this specific audience
3. What topics/angles are underused but high-potential in this niche
4. What hook patterns stop the scroll for this audience

Be specific to "${profile.niche}" — not generic social media advice.`;

  return invokeclaude(system, user, 1024);
}

// ─── Step 2: Virality Signal Analysis ────────────────────────────────────────
async function analyzeViralitySignals(
  profile: CreatorProfile,
  research: string
): Promise<string> {
  const system = `You are an expert content strategist who specialises in reverse-engineering viral content.
You identify the specific patterns, structures, and psychological triggers that make content spread.
Output plain paragraphs only.`;

  const exampleSection = profile.examplePosts.length
    ? `Creator's past winning posts:
${profile.examplePosts.map((p, i) => `[Post ${i + 1}]: "${p}"`).join("\n")}`
    : "No example posts provided.";

  const user = `Analyse virality signals for this creator:

Name: ${profile.name}
Niche: ${profile.niche}
Audience: ${profile.targetAudience}
Voice: ${profile.voiceTone}
Goal: ${profile.goals || "Grow audience and engagement"}
${exampleSection}

Research context:
${research}

Based on all the above, write a 150-word virality brief covering:
- The 3 highest-leverage content angles for THIS creator specifically
- What makes their voice/style uniquely shareable
- The exact format (carousel, reel, thread, etc.) most likely to get reach right now
- One "contrarian" angle that would surprise their audience in a good way`;

  return invokeclaude(system, user, 1024);
}

// ─── Step 3: Batch Generation ────────────────────────────────────────────────
async function generateBatch(
  profile: CreatorProfile,
  research: string,
  viralityBrief: string,
  request: GenerateIdeasRequest
): Promise<string> {
  const vibeGuide: Record<Vibe, string> = {
    "surprise-me":    "Mix formats freely — include a hot take, a list, a story, and a data-driven post.",
    motivational:     "Focus on mindset shifts, overcoming obstacles, identity-level transformations. Use 'you' language.",
    educational:      "Teach one clear concept per post. Use numbered lists, frameworks, or step-by-step formats.",
    "case-study":     "Real or plausible scenario: situation → problem → solution → result. Use specific numbers.",
    "quick-tip":      "Single actionable insight. Short, punchy. Delivers value in the first 2 lines.",
    "personal-story": "First-person narrative with vulnerability. Clear arc: struggle → insight → lesson.",
    trending:         "Tap a current moment, cultural conversation, or trending format in this niche.",
  };

  const system = `You are a world-class social media copywriter and content strategist.
You write for ${profile.niche} creators with a ${profile.voiceTone} voice.
You ONLY output a valid raw JSON array. No preamble, no explanation, no markdown fences, no commentary.
Every string value must be valid JSON (escape quotes, no unescaped newlines).`;

  const user = `Research: ${research}

Virality brief: ${viralityBrief}

Creator: ${profile.name} | Niche: ${profile.niche} | Voice: ${profile.voiceTone}
Audience: ${profile.targetAudience}
Vibe: "${request.vibe}" — ${vibeGuide[request.vibe]}
${request.customPrompt ? `Custom angle: "${request.customPrompt}"` : ""}
Platforms: ${request.platforms.join(", ")}

Generate exactly ${request.count ?? 7} post ideas as a JSON array.
Each object MUST have these exact keys (all strings/arrays of strings):
{
  "hook": "The opening line — irresistible, specific, creates a curiosity gap",
  "caption": "Full caption 80–220 words, platform-appropriate, conversational, ends with engagement prompt",
  "visualDescription": "Specific description of the image/video/graphic needed — colours, composition, mood",
  "cta": "One clear call to action",
  "hashtags": ["array", "of", "8-12", "hashtags"],
  "platform": "one of: ${request.platforms.map((p) => `"${p}"`).join(" | ")}",
  "format": "one of: Carousel | Reel | Thread | Single image | Short video | Talking head | Text post"
}

Vary the formats and angles across the batch. Make each one distinct.
Output ONLY the JSON array. Absolutely nothing else.`;

  return invokeclaude(system, user, 4096);
}

// ─── Step 4: Score & Refine ───────────────────────────────────────────────────
async function scoreAndRefine(
  rawJson: string,
  profile: CreatorProfile
): Promise<string> {
  const system = `You are a viral content analyst and editor.
You score post ideas 1–10 for engagement potential based on: emotional resonance, curiosity gap, specificity, relatability, platform fit, and hook strength.
You ONLY output a valid raw JSON array. No preamble, no explanation, no markdown fences.`;

  const user = `Score and enhance these post ideas for a ${profile.niche} creator.
Audience: ${profile.targetAudience} | Voice: ${profile.voiceTone}

Ideas JSON:
${rawJson}

For each idea, add EXACTLY these fields to the existing object:
- "id": unique 8-char alphanumeric string
- "viralityScore": integer 1–10 (be honest and calibrated — average should be 6–7, only truly exceptional ideas get 9–10)
- "viralityReason": "1–2 sentences: WHY this score — name the specific psychological trigger or format advantage"
- "createdAt": "${new Date().toISOString()}"

Also IMPROVE each "hook" — make it sharper, more specific, more irresistible if needed.
Also IMPROVE each "caption" — tighten the opening 2 lines, ensure there's a clear story arc.

Return the COMPLETE updated array with ALL original fields PLUS the new fields.
ONLY the JSON array. Nothing else.`;

  return invokeclaude(system, user, 4096);
}

// ─── Refine a single idea ─────────────────────────────────────────────────────
export type RefineMode = "more-viral" | "shorten-reels" | "add-story" | "professional" | "contrarian";

export async function refineIdea(
  idea: PostIdea,
  mode: RefineMode,
  profile: CreatorProfile
): Promise<PostIdea> {
  const modeInstructions: Record<RefineMode, string> = {
    "more-viral":
      "Amplify the emotional hook, increase the curiosity gap in the first line, add a more specific/surprising detail, make the CTA more compelling.",
    "shorten-reels":
      "Rewrite for short-form video (TikTok/Reels). Hook must work as a spoken first sentence under 10 words. Caption becomes a script: max 60 words, punchy sentences, ends with a verbal CTA.",
    "add-story":
      "Reframe as a first-person story. Add a specific struggle, a turning point moment, and a clear lesson. Use 'I' language throughout. Keep it real, not polished.",
    professional:
      "Elevate the tone for LinkedIn. More data-driven, authoritative, thought-leadership angle. Remove casual language. Add a professional insight or industry observation.",
    contrarian:
      "Flip the conventional wisdom. Take an unexpected or slightly controversial angle that challenges what most people in this niche believe. Back it up with a specific reason.",
  };

  const system = `You are a viral social media editor. You refine individual post ideas to maximise engagement.
You ONLY output a single valid JSON object. No preamble, no explanation, no markdown fences.`;

  const user = `Refine this post idea for a ${profile.niche} creator (${profile.voiceTone} voice):

Current idea:
${JSON.stringify(idea, null, 2)}

Refinement mode: "${mode}"
Instructions: ${modeInstructions[mode]}

Return the COMPLETE updated JSON object with ALL original fields, but with improved:
- hook (sharper, more platform-appropriate)
- caption (rewritten per the mode instructions)
- cta (updated to match new angle)
- hashtags (update if needed for new angle)
- viralityScore (re-score honestly)
- viralityReason (explain the new score)

Keep the same id, platform, format, visualDescription, createdAt unless the mode requires changing format.
Output ONLY the JSON object.`;

  const raw  = await invokeclaude(system, user, 2048);
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Could not parse refined idea from AI response");
  return JSON.parse(match[0]) as PostIdea;
}

// ─── Parse JSON safely ────────────────────────────────────────────────────────
function parseJsonArray(raw: string): PostIdea[] {
  // Strip any accidental markdown fences or leading text
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) {
    throw new Error(
      `AI did not return a JSON array.\nFirst 300 chars: ${raw.slice(0, 300)}`
    );
  }
  try {
    return JSON.parse(match[0]) as PostIdea[];
  } catch (e) {
    throw new Error(`JSON parse failed: ${String(e)}\nRaw: ${match[0].slice(0, 300)}`);
  }
}

// ─── Main orchestrator ────────────────────────────────────────────────────────
export async function runFullChain(
  request: GenerateIdeasRequest,
  onStep?: StepCallback
): Promise<GenerateIdeasResponse> {
  const { profile, vibe } = request;

  // Step 1
  onStep?.(1, "Researching trends in your niche…");
  const research = await researchNiche(profile, vibe);

  // Step 2
  onStep?.(2, "Analysing virality signals for your profile…");
  const viralityBrief = await analyzeViralitySignals(profile, research);

  // Step 3
  onStep?.(3, `Generating ${request.count ?? 7} tailored ideas…`);
  const rawJson = await generateBatch(profile, research, viralityBrief, request);

  // Step 4
  onStep?.(4, "Scoring and refining for maximum impact…");
  const scoredJson = await scoreAndRefine(rawJson, profile);

  // Parse
  let ideas: PostIdea[] = parseJsonArray(scoredJson);

  // Ensure every idea has an id
  ideas = ideas.map((idea) => ({
    ...idea,
    id: idea.id ?? generateId(),
    createdAt: idea.createdAt ?? new Date().toISOString(),
  }));

  // Sort best first
  ideas.sort((a, b) => b.viralityScore - a.viralityScore);

  // Build session summary from research
  const sessionSummary = [
    `Research insight: ${research.slice(0, 180).replace(/\n/g, " ")}…`,
    `Virality focus: ${viralityBrief.slice(0, 160).replace(/\n/g, " ")}…`,
  ].join(" | ");

  return { ideas, sessionSummary };
}
