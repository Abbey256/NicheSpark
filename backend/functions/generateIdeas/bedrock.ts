import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import type {
  CreatorProfile,
  GenerateIdeasRequest,
  GenerateIdeasResponse,
  PostIdea,
  Platform,
} from "../shared/types";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
});

// Claude 3 Haiku — fast and cheap, great for structured output
const MODEL_ID = "anthropic.claude-3-haiku-20240307-v1:0";

async function invokeClause(systemPrompt: string, userMessage: string): Promise<string> {
  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const cmd = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body,
  });

  const res = await client.send(cmd);
  const decoded = JSON.parse(new TextDecoder().decode(res.body)) as {
    content: { text: string }[];
  };
  return decoded.content[0].text.trim();
}

// ── Step 1: Analyze niche + extract virality signals ──────────────────────────

async function analyzeNiche(profile: CreatorProfile): Promise<string> {
  const system = `You are an expert social media strategist who specializes in virality research and niche audience psychology.
Your task: analyze a creator's profile and extract actionable virality signals specific to their niche.
Be concise, specific, and data-driven. Output plain text paragraphs (no markdown headers).`;

  const user = `Creator profile:
- Niche: ${profile.niche}
- Target audience: ${profile.targetAudience}
- Platforms: ${profile.platforms.join(", ")}
- Voice/tone: ${profile.voiceTone}
- Goals: ${profile.goals || "Grow audience and increase engagement"}
- Example high-performing posts:
${profile.examplePosts.map((p, i) => `  ${i + 1}. "${p}"`).join("\n")}

Analyze: What content formats, emotional triggers, story structures, and hook patterns perform best in this specific niche?
What makes their audience stop scrolling? What posting angles are underutilized but high-potential?
Keep your analysis to 150–200 words.`;

  return invokeClause(system, user);
}

// ── Step 2: Generate raw batch of ideas ───────────────────────────────────────

async function generateRawIdeas(
  profile: CreatorProfile,
  nicheAnalysis: string,
  request: GenerateIdeasRequest
): Promise<string> {
  const vibeInstructions: Record<string, string> = {
    motivational: "Focus on overcoming struggle, mindset shifts, and inspiring transformation stories.",
    educational: "Focus on teaching a clear, actionable insight or framework. Use list formats.",
    "case-study": "Use a real or plausible scenario with context → problem → solution → result.",
    "quick-tip": "A single powerful tip that delivers immediate value. Short, punchy, actionable.",
    "personal-story": "Use first-person narrative, vulnerability, and a clear lesson or takeaway.",
    trending: "Tap into a current cultural moment, trend, or widely discussed topic in this niche.",
    "surprise-me": "Mix formats — include at least one controversial take, one listicle, one personal story.",
  };

  const system = `You are a world-class social media content strategist and copywriter.
You specialize in creating viral, platform-optimized content for ${profile.niche}.
You always write in a ${profile.voiceTone} voice.
You ONLY output valid JSON arrays — no preamble, no explanation, no markdown fences.`;

  const user = `Niche analysis: ${nicheAnalysis}

Creator: ${profile.name}, Niche: ${profile.niche}
Audience: ${profile.targetAudience}
Vibe for this batch: ${request.vibe} — ${vibeInstructions[request.vibe] ?? ""}
${request.customPrompt ? `Custom angle: ${request.customPrompt}` : ""}
Target platforms: ${request.platforms.join(", ")}

Generate exactly ${request.count ?? 7} post ideas as a raw JSON array.
Each object must have these keys:
- hook: string (the opening line/first 3 seconds — make it impossible to scroll past)
- caption: string (full caption, ~100–200 words, platform-appropriate)
- visualDescription: string (describe the image/video/graphic needed)
- cta: string (clear call-to-action)
- hashtags: string[] (8–12 relevant hashtags including niche + broad)
- platform: one of [${request.platforms.map((p) => `"${p}"`).join(", ")}]
- format: string (e.g. "Carousel", "Reel", "Thread", "Single image", "Short video")

Output ONLY the JSON array. No other text.`;

  return invokeClause(system, user);
}

// ── Step 3: Score + self-critique each idea ───────────────────────────────────

async function scoreAndRefineIdeas(
  rawIdeasJson: string,
  profile: CreatorProfile
): Promise<string> {
  const system = `You are a viral content analyst who scores social media post ideas for engagement potential.
You evaluate based on: emotional resonance, curiosity gap, specificity, relatability, platform fit, and trending alignment.
You ONLY output valid JSON arrays — no preamble, no explanation, no markdown fences.`;

  const user = `Here are raw post ideas for a ${profile.niche} creator targeting: ${profile.targetAudience}.
Creator voice: ${profile.voiceTone}

Ideas to score:
${rawIdeasJson}

For each idea, add these two fields:
- viralityScore: integer 1–10 (be honest — most should be 6–8, only truly exceptional ideas get 9–10)
- viralityReason: string (1–2 sentences explaining WHY this score — be specific about what format/trigger earns this rating)

Also add: "id": a unique 8-char alphanumeric string, "createdAt": "${new Date().toISOString()}"

Output the COMPLETE updated JSON array with all original fields PLUS the new fields. ONLY JSON, nothing else.`;

  return invokeClause(system, user);
}

// ── Orchestrator: runs all 3 steps ───────────────────────────────────────────

export async function runIdeaChain(
  request: GenerateIdeasRequest
): Promise<GenerateIdeasResponse> {
  const { profile } = request;

  // Step 1
  const nicheAnalysis = await analyzeNiche(profile);

  // Step 2
  const rawJson = await generateRawIdeas(profile, nicheAnalysis, request);

  // Step 3
  const scoredJson = await scoreAndRefineIdeas(rawJson, profile);

  // Parse the final JSON — handle possible stray text
  let ideas: PostIdea[];
  try {
    // Extract JSON array even if Claude accidentally adds text
    const match = scoredJson.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("No JSON array found in AI response");
    ideas = JSON.parse(match[0]) as PostIdea[];
  } catch (err) {
    throw new Error(`Failed to parse AI response: ${String(err)}\nRaw: ${scoredJson.slice(0, 300)}`);
  }

  // Sort by virality score descending
  ideas.sort((a, b) => b.viralityScore - a.viralityScore);

  // Generate a session summary using the analysis
  const sessionSummary = `${profile.name}'s ${request.vibe} batch: ${nicheAnalysis.slice(0, 180)}…`;

  return { ideas, sessionSummary };
}
