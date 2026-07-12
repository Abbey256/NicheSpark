/**
 * NicheSpark Lambda — paste into AWS Console Lambda editor.
 * Runtime: Node.js 20.x
 * IAM: AmazonBedrockFullAccess on execution role
 *
 * IMPORTANT — Function URL CORS settings:
 *   Do NOT enable CORS in the Function URL config.
 *   This function handles CORS headers itself to avoid duplicates.
 */

import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION ?? "us-east-1" });
const MODEL  = "anthropic.claude-3-haiku-20240307-v1:0";

// Single source of truth for CORS — do NOT also set in Function URL config
const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

async function claude(system, user, maxTokens = 4096) {
  const body = JSON.stringify({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });
  const res  = await client.send(new InvokeModelCommand({
    modelId: MODEL,
    contentType: "application/json",
    accept: "application/json",
    body: new TextEncoder().encode(body),
  }));
  const json = JSON.parse(new TextDecoder().decode(res.body));
  return json.content[0].text.trim();
}

function parseArray(raw) {
  const m = raw.match(/\[[\s\S]*\]/);
  if (!m) throw new Error("No JSON array in response");
  return JSON.parse(m[0]);
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function respond(statusCode, body) {
  return {
    statusCode,
    headers: { ...CORS, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export async function handler(event) {
  const method = event.requestContext?.http?.method ?? event.httpMethod ?? "POST";

  // CORS preflight
  if (method === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }

  try {
    const body = JSON.parse(event.body ?? "{}");
    const { profile, vibe, customPrompt, platforms, count = 7 } = body;

    if (!profile || !vibe || !platforms?.length) {
      return respond(400, { success: false, error: "profile, vibe, and platforms are required" });
    }

    const vibeGuide = {
      "surprise-me":    "Mix formats — hot take, list, story, data-driven post.",
      motivational:     "Mindset shifts, overcoming obstacles, identity-level transformation.",
      educational:      "Teach one clear concept. Use numbered lists or step-by-step format.",
      "case-study":     "Situation → problem → solution → result. Use specific numbers.",
      "quick-tip":      "Single actionable insight. Short, punchy, immediate value.",
      "personal-story": "First-person narrative. Struggle → insight → lesson.",
      trending:         "Tap a current cultural moment or trending format in this niche.",
    };

    // ── Step 1: Niche research ──────────────────────────────────────────────
    const research = await claude(
      `You are a social media trend analyst specialising in content virality.
Research what content formats and angles perform best in specific niches.
Output plain paragraphs only — no markdown, no bullet symbols.`,
      `Niche: "${profile.niche}"
Audience: "${profile.targetAudience}"
Platforms: ${platforms.join(", ")}
Vibe: "${vibe}"

What formats, emotional triggers, and hook patterns perform best here right now?
What angles are underused but high-potential? Keep it to 120 words.`,
      800
    );

    // ── Step 2: Generate batch ──────────────────────────────────────────────
    const rawJson = await claude(
      `You are a world-class social media copywriter for the ${profile.niche} niche.
Voice/tone: ${profile.voiceTone}.
You output ONLY a valid raw JSON array. No preamble, no explanation, no markdown fences.`,
      `Research context: ${research}

Creator: ${profile.name} | Niche: ${profile.niche} | Audience: ${profile.targetAudience}
Vibe: "${vibe}" — ${vibeGuide[vibe] ?? "mix of formats"}
${customPrompt ? `Custom angle: "${customPrompt}"` : ""}
Platforms: ${platforms.join(", ")}
${profile.examplePosts?.length ? `Style reference posts:\n${profile.examplePosts.map((p,i)=>`[${i+1}] "${p}"`).join("\n")}` : ""}

Generate exactly ${count} post ideas as a JSON array. Each object MUST have:
{
  "hook": "irresistible opening line",
  "caption": "full caption 80-200 words, conversational, ends with engagement question",
  "visualDescription": "specific description of image/video needed",
  "cta": "clear call to action",
  "hashtags": ["8-12 relevant hashtags"],
  "platform": "one of: ${platforms.join(" | ")}",
  "format": "one of: Carousel | Reel | Thread | Single image | Short video | Talking head"
}
Output ONLY the JSON array. Nothing else.`,
      3500
    );

    // ── Step 3: Score + refine ──────────────────────────────────────────────
    const scoredJson = await claude(
      `You are a viral content analyst. Score social media ideas honestly.
Output ONLY a valid raw JSON array. No preamble, no markdown fences.`,
      `Score these ${profile.niche} post ideas. Audience: ${profile.targetAudience}.

${rawJson}

For each idea add:
- "id": unique 8-char alphanumeric string
- "viralityScore": integer 1-10 (calibrated — most should be 6-8, only exceptional ideas get 9-10)
- "viralityReason": "1-2 sentences: name the specific psychological trigger or format advantage"
- "createdAt": "${new Date().toISOString()}"

Also sharpen each "hook" to be more specific and irresistible.
Return the COMPLETE array with ALL original fields PLUS new fields.
Output ONLY the JSON array.`,
      4096
    );

    let ideas = parseArray(scoredJson);
    ideas = ideas.map(i => ({ ...i, id: i.id ?? uid(), createdAt: i.createdAt ?? new Date().toISOString() }));
    ideas.sort((a, b) => b.viralityScore - a.viralityScore);

    const sessionSummary = `${profile.niche} research: ${research.replace(/\n/g, " ").slice(0, 200)}…`;

    return respond(200, { success: true, data: { ideas, sessionSummary } });

  } catch (err) {
    console.error("Lambda error:", err);
    return respond(500, { success: false, error: err?.message ?? "Internal server error" });
  }
}
