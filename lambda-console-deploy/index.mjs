/**
 * NicheSpark Lambda — paste this into the AWS Console Lambda editor.
 * Runtime: Node.js 20.x
 * Required env var: (none — uses execution role for Bedrock auth)
 * Required IAM: AmazonBedrockFullAccess on the execution role
 */

import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION ?? "us-east-1" });
const MODEL  = "anthropic.claude-3-haiku-20240307-v1:0";

const CORS = {
  "Access-Control-Allow-Origin": "*",
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

function id() {
  return Math.random().toString(36).slice(2, 10);
}

export async function handler(event) {
  // CORS preflight
  if (event.requestContext?.http?.method === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }

  try {
    const { profile, vibe, customPrompt, platforms, count = 7 } = JSON.parse(event.body ?? "{}");

    if (!profile || !vibe || !platforms?.length) {
      return respond(400, { success: false, error: "profile, vibe, platforms required" });
    }

    const vibeGuide = {
      "surprise-me":    "Mix formats — hot take, list, story, data-driven post.",
      motivational:     "Mindset shifts, overcoming obstacles, identity-level transformation.",
      educational:      "Teach one clear concept. Use numbered lists or step-by-step.",
      "case-study":     "Situation → problem → solution → result. Use specific numbers.",
      "quick-tip":      "Single actionable insight. Short, punchy, immediate value.",
      "personal-story": "First-person narrative. Struggle → insight → lesson.",
      trending:         "Tap a current cultural moment or trending format in this niche.",
    };

    // Step 1: Research
    const research = await claude(
      `You are a social media trend analyst. Research what content works in specific niches. Output plain paragraphs only.`,
      `Niche: "${profile.niche}" | Audience: "${profile.targetAudience}" | Platforms: ${platforms.join(", ")} | Vibe: "${vibe}"
Research what formats, emotional triggers, and hook patterns perform best here. 150 words max.`,
      800
    );

    // Step 2: Generate
    const rawJson = await claude(
      `You are a social media copywriter for ${profile.niche}. Voice: ${profile.voiceTone}.
Output ONLY a valid raw JSON array. No preamble, no markdown fences.`,
      `Research: ${research}
Creator: ${profile.name} | Niche: ${profile.niche} | Audience: ${profile.targetAudience}
Vibe: "${vibe}" — ${vibeGuide[vibe] ?? ""}
${customPrompt ? `Custom angle: "${customPrompt}"` : ""}
Platforms: ${platforms.join(", ")}

Generate exactly ${count} post ideas as JSON array. Each object:
{"hook":"...","caption":"...","visualDescription":"...","cta":"...","hashtags":["..."],"platform":"${platforms[0]}","format":"Carousel|Reel|Thread|Single image|Short video"}
Output ONLY the JSON array.`,
      3500
    );

    // Step 3: Score
    const scoredJson = await claude(
      `You are a viral content analyst. Output ONLY a valid raw JSON array. No preamble, no fences.`,
      `Score these ideas for a ${profile.niche} creator targeting: ${profile.targetAudience}.
Ideas: ${rawJson}
Add to each object:
- "id": unique 8-char alphanumeric
- "viralityScore": integer 1-10 (honest — most should be 6-8)
- "viralityReason": "1-2 sentences: WHY this score"
- "createdAt": "${new Date().toISOString()}"
Also improve each "hook" to be sharper. Output ONLY the complete JSON array.`,
      4096
    );

    let ideas = parseArray(scoredJson);
    ideas = ideas.map(i => ({ ...i, id: i.id ?? id() }));
    ideas.sort((a, b) => b.viralityScore - a.viralityScore);

    const sessionSummary = `${profile.niche} insights: ${research.slice(0, 200)}…`;

    return respond(200, { success: true, data: { ideas, sessionSummary } });

  } catch (err) {
    console.error(err);
    return respond(500, { success: false, error: err.message ?? "Internal error" });
  }
}

function respond(statusCode, body) {
  return { statusCode, headers: { ...CORS, "Content-Type": "application/json" }, body: JSON.stringify(body) };
}
