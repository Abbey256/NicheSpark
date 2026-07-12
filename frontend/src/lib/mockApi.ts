/**
 * mockApi.ts — Dynamic mock that varies by niche, vibe, and profile.
 * Used when no AWS credentials are present.
 */
import type { GenerateIdeasRequest, GenerateIdeasResponse, PostIdea, Platform } from "@/types";
import { generateId } from "@/lib/utils";

const MOCK_DELAY_MS = 2200;
function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

// ── Templates that slot in the creator's actual niche + audience ──────────────

function makeIdeas(profile: { niche: string; targetAudience: string; voiceTone: string }, platforms: Platform[]): Omit<PostIdea, "id" | "createdAt" | "platform">[] {
  const n = profile.niche;
  const a = profile.targetAudience.split(" ").slice(0, 6).join(" ");

  return [
    {
      hook: `I've been in ${n} for years. Here's the one thing nobody tells beginners 👇`,
      caption: `Everyone starting out in ${n} makes the same mistake.\n\nThey focus on doing MORE instead of doing it RIGHT.\n\nHere's what actually moves the needle for ${a}:\n\n✅ Start with one thing and master it\n✅ Track your progress every single week\n✅ Find a community that keeps you accountable\n\nThe people who succeed in ${n} aren't the most talented. They're the most consistent.\n\nWhich of these are you working on right now? Drop it in the comments 👇`,
      visualDescription: `Split image: left side shows a confused beginner overwhelmed by options, right side shows a calm focused person with a clear simple plan. Clean minimal aesthetic.`,
      viralityScore: 9,
      viralityReason: `"Nobody tells beginners" hook triggers strong curiosity gap. Directly addresses ${a} — they'll share this because it feels like it was written for them.`,
      hashtags: [`#${n.replace(/\s+/g, "").toLowerCase()}`, "#beginnertips", "#contentcreator", "#growthmindset", "#consistency", "#community", "#starthere"],
      cta: "Save this and share it with someone just starting out.",
      format: "Carousel",
    },
    {
      hook: `Hot take: most ${n} advice online is making you WORSE. Here's why.`,
      caption: `I know that's a bold claim. But hear me out.\n\nThe ${n} space is flooded with generic, one-size-fits-all advice that doesn't account for real people like ${a}.\n\nWhat actually works:\n→ Advice tailored to YOUR situation\n→ Small consistent wins over big dramatic changes\n→ Ignoring 90% of what you see online\n\nThe people making real progress in ${n} aren't following the crowd. They're doing less, but doing it smarter.\n\nAgree or disagree? I want to hear your take 👇`,
      visualDescription: `Bold text overlay on dark background: "The ${n} advice you're following is broken." High contrast, thumb-stopping.`,
      viralityScore: 9,
      viralityReason: `Contrarian hot take in a crowded niche drives comments and shares. The disagreement hook forces engagement from both sides.`,
      hashtags: [`#${n.replace(/\s+/g, "").toLowerCase()}`, "#hottake", "#realtalk", "#unpopularopinion", "#truthbomb"],
      cta: "Follow for more takes they won't tell you elsewhere.",
      format: "Talking head",
    },
    {
      hook: `3 things I wish I knew before starting ${n} (would have saved me years)`,
      caption: `Looking back, these three things changed everything for me in ${n}:\n\n1️⃣ You don't need to be an expert to start — you just need to be one step ahead\n2️⃣ Your "obvious" knowledge is gold to ${a} who are just beginning\n3️⃣ Consistency beats perfection every single time\n\nI spent so long waiting until I was "ready." \n\nThe truth? I learned more by starting imperfectly than by planning perfectly.\n\nWhich one of these hits home for you? 👇`,
      visualDescription: `Clean numbered list graphic with a warm gradient background. Each number in a circle, bold sans-serif font. Minimal and elegant.`,
      viralityScore: 8,
      viralityReason: `"Wish I knew" format performs 2–3× above average because it positions the creator as relatable AND authoritative. High save rate.`,
      hashtags: [`#${n.replace(/\s+/g, "").toLowerCase()}tips`, "#lessonslearned", "#creatoradvice", "#growthhacks", "#starttoday"],
      cta: "Save this for when you need a reminder to just start.",
      format: "Single image",
    },
    {
      hook: `A ${a.split(" ")[0]} DM'd me asking how to get results in ${n}. Here's exactly what I told them.`,
      caption: `Got a DM last week from someone who was frustrated.\n\nThey'd been trying to make progress in ${n} for months with nothing to show for it.\n\nHere's the framework I shared:\n\nStep 1: Define ONE clear goal (not five)\nStep 2: Build the smallest possible daily habit around it\nStep 3: Measure weekly, adjust monthly\nStep 4: Find one accountability partner\n\nThree weeks later they messaged me again. Real progress.\n\nThe system isn't complicated. The hard part is trusting simple over complex.\n\nWant the full breakdown? Drop "SYSTEM" in the comments 👇`,
      visualDescription: `Phone screen mockup showing a DM conversation, then cutting to a results graphic. Authentic, conversational feel.`,
      viralityScore: 8,
      viralityReason: `Real story format with a specific outcome drives trust. "Drop SYSTEM" CTA is a proven engagement driver that also boosts algorithmic reach.`,
      hashtags: [`#${n.replace(/\s+/g, "").toLowerCase()}`, "#dmme", "#realresults", "#framework", "#accountability"],
      cta: `Drop "SYSTEM" in the comments for the full breakdown.`,
      format: "Reel",
    },
    {
      hook: `What ${n} actually looks like at week 1 vs week 12 (no filters)`,
      caption: `Week 1 in ${n}:\n→ Overwhelmed by information\n→ Comparing yourself to everyone\n→ Questioning if you're cut out for this\n\nWeek 12:\n→ You have a system that works for YOU\n→ Small wins feel massive\n→ You can't imagine going back\n\nThe gap between week 1 and week 12 isn't talent.\n\nIt's just people who kept going when it got uncomfortable.\n\nIf you're in week 1 right now — this is your sign to stay.\n\nTag someone who needs to see this 👇`,
      visualDescription: `Two-column before/after graphic. Week 1: chaotic sticky notes and question marks. Week 12: clean organised system with green checkmarks. Same person, different energy.`,
      viralityScore: 9,
      viralityReason: `Before/after with emotional arc is the highest-performing format in transformation niches. "Tag someone" CTA drives organic reach. High relatability for ${a}.`,
      hashtags: [`#${n.replace(/\s+/g, "").toLowerCase()}journey`, "#week1vs12", "#transformation", "#keepgoing", "#progress"],
      cta: "Tag someone who's in their week 1 right now.",
      format: "Carousel",
    },
    {
      hook: `The 5-minute ${n} routine that changed everything for me`,
      caption: `I used to think I needed hours to make progress in ${n}.\n\nThen I built this 5-minute daily routine:\n\n⏱ Min 1–2: Review my one goal for the day\n⏱ Min 3: Do the one action that moves the needle\n⏱ Min 4: Note what worked yesterday\n⏱ Min 5: Set intention for tomorrow\n\nThat's it.\n\nNo complicated system. No 2-hour deep work blocks.\n\nJust 5 minutes of intentional action, every single day.\n\nFor ${a}, this is the gateway habit. Everything grows from here.\n\nSteal this. It's yours.`,
      visualDescription: `Minimalist timer graphic — 5 segments, each labelled. Clean dark background with purple accent. Feels premium and actionable.`,
      viralityScore: 8,
      viralityReason: `Low-barrier entry ("only 5 minutes") removes the biggest objection. Numbered steps drive saves. "Steal this" CTA reduces friction to share.`,
      hashtags: [`#${n.replace(/\s+/g, "").toLowerCase()}`, "#5minuteroutine", "#dailyhabits", "#productivityhacks", "#morningroutine"],
      cta: "Save this. Try it tomorrow morning.",
      format: "Carousel",
    },
    {
      hook: `Nobody in ${n} talks about this. I'm going to change that.`,
      caption: `There's a topic in ${n} that everyone experiences but nobody posts about.\n\nThe plateau.\n\nThat moment when you've been putting in the work, doing everything right, and… nothing seems to be moving.\n\nHere's what I've learned: the plateau isn't a sign to stop. It's a sign you're about to level up.\n\nFor ${a}, this is the moment that separates the ones who make it from the ones who quit.\n\nNext time you hit a plateau, ask yourself:\n→ Am I tracking the right metrics?\n→ Have I changed anything in the last 4 weeks?\n→ Am I comparing my chapter 3 to someone else's chapter 20?\n\nThe plateau is the game. Learn to play it.\n\nHave you hit a plateau recently? What helped you push through? 👇`,
      visualDescription: `Flat line graph that suddenly spikes upward after a long plateau. Simple, clean, powerful visual metaphor. White on dark background.`,
      viralityScore: 7,
      viralityReason: `Addresses a universal but underserved pain point. The graph visual is highly shareable. Question CTA drives genuine comment engagement.`,
      hashtags: [`#${n.replace(/\s+/g, "").toLowerCase()}`, "#plateau", "#keepgoing", "#mindset", "#levelup", "#realtalk"],
      cta: "Share this with someone who needs to hear it today.",
      format: "Single image",
    },
  ];
}

export async function generateIdeasMock(request: GenerateIdeasRequest): Promise<GenerateIdeasResponse> {
  await sleep(MOCK_DELAY_MS);

  const { profile } = request;
  const platforms = request.platforms.length > 0 ? request.platforms : profile.platforms;
  const usePlatforms: Platform[] = platforms.length > 0 ? platforms : ["instagram" as Platform];

  const templates = makeIdeas(profile, usePlatforms);

  const ideas: PostIdea[] = templates.map((t, i) => ({
    ...t,
    id: generateId(),
    platform: usePlatforms[i % usePlatforms.length],
    createdAt: new Date().toISOString(),
  }));

  // Sort by virality score
  ideas.sort((a, b) => b.viralityScore - a.viralityScore);

  return {
    ideas,
    sessionSummary: `Mock insight for "${profile.niche}": Your audience (${profile.targetAudience.slice(0, 80)}) responds best to relatable stories, contrarian takes, and actionable frameworks. Add AWS credentials to unlock real Bedrock AI analysis tailored to your exact niche.`,
  };
}
