/**
 * Mock API — returns realistic data so you can run and refine the UI
 * without AWS credentials. Swap out for the real api.ts calls when ready.
 *
 * Activated automatically when VITE_API_URL is not set (dev mode).
 */
import type {
  GenerateIdeasRequest,
  GenerateIdeasResponse,
  PostIdea,
  Platform,
} from "@/types";
import { generateId } from "@/lib/utils";

const MOCK_DELAY_MS = 2800; // simulate Bedrock chain latency

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const MOCK_IDEAS: Omit<PostIdea, "id" | "createdAt" | "platform">[] = [
  {
    hook: "I trained every day for 30 days with zero equipment. Here's what actually changed 👇",
    caption:
      "No gym. No excuses. Just 20 minutes a day, a mat, and some serious consistency.\n\nWeek 1: Everything hurt. Week 2: My energy went through the roof. Week 4: People started asking what I was doing differently.\n\nHere's the exact routine I followed — save this for tomorrow morning.\n\n✅ 20 push-ups\n✅ 30 squats\n✅ 1-min plank\n✅ 15 glute bridges\n✅ Repeat 3x\n\nNo equipment. No excuses. Just start.",
    visualDescription:
      "Split image: left side shows a messy living room floor with a yoga mat, right side shows confident posture after 30 days. Authentic, not stock-photo perfect.",
    viralityScore: 9,
    viralityReason:
      "30-day transformation + zero-barrier entry (no equipment) hits two massive emotional triggers: aspiration and accessibility. The before/after format performs 3–4× above average in fitness niches.",
    hashtags: ["#noequipmentworkout", "#homefitness", "#30daychallenge", "#fitnessjourney", "#workoutmotivation", "#beginnerworkout", "#fitnessmotivation", "#healthylifestyle"],
    cta: "Save this and tag someone who needs to start tomorrow.",
    format: "Carousel",
  },
  {
    hook: "The #1 mistake beginners make that kills their progress in week 2",
    caption:
      "I see it every single time.\n\nSomeone starts strong, crushes week 1, then disappears by week 2. Not because they're lazy — because they made this one mistake.\n\nThey went too hard, too fast.\n\nYour body isn't used to this yet. When you feel sore, rest IS progress. When you skip a day, that's not failure — that's recovery.\n\nThe goal in your first 30 days isn't transformation. It's building the habit.\n\nDrop a 💪 if you're in the habit-building phase right now.",
    visualDescription:
      "Text overlay on a calm, warm-toned background. Font: bold white text on dark gradient. No stock photos — feels like a personal note.",
    viralityScore: 8,
    viralityReason:
      "Contrarian framing ('mistake' + permission to slow down) drives saves and shares because it directly addresses the #1 fear beginners have. Comment bait is strong.",
    hashtags: ["#beginnerfit", "#fitnesstips", "#workoutadvice", "#fitnessmindset", "#gymtips", "#fitnessforbeginners", "#movementismedicine"],
    cta: "Follow for honest fitness advice — no bro-science.",
    format: "Single image",
  },
  {
    hook: "What 20 minutes of movement does to your brain (this is why I never skip)",
    caption:
      "I used to think rest days were lazy days.\n\nThen I learned what exercise actually does to your prefrontal cortex.\n\nAfter just 20 minutes of moderate movement:\n🧠 BDNF spikes (brain fertilizer — literally grows new connections)\n😌 Cortisol drops by up to 26%\n⚡ Focus improves for 2–3 hours after\n\nThis is why I moved my workout to 7am. Not for aesthetics. For the mental edge.\n\nYou don't need a gym. You need 20 minutes and a commitment.",
    visualDescription:
      "Aesthetic flat lay: journal, water bottle, earbuds on a wooden floor. Soft morning light. Clean and aspirational without being unrealistic.",
    viralityScore: 8,
    viralityReason:
      "Science-backed content with a personal story wrapper performs extremely well with 25–40yo audiences. The 'unexpected benefit' angle (brain, not body) drives shares from non-fitness followers too.",
    hashtags: ["#exerciseandthebrain", "#morningroutine", "#mentalhealth", "#movementismedicine", "#scienceoffitness", "#productivityhacks", "#mindandbody"],
    cta: "Share this with someone who needs a reason to start moving.",
    format: "Reel",
  },
  {
    hook: "Hot take: Gym anxiety is not a confidence problem. It's a knowledge problem.",
    caption:
      "Hear me out.\n\nMost people who feel anxious at the gym aren't insecure — they're just uncertain.\n\nThey don't know:\n• Which machines to use\n• What 'proper form' actually looks like\n• Whether they're doing enough or too much\n\nAnxiety fills the knowledge gap.\n\nThe fix? Start at home. Build a base. Learn the movements before you perform them in public.\n\nBy the time you walk into a gym, you'll own the room.\n\nAm I wrong? Let me know 👇",
    visualDescription:
      "POV shot of an empty gym floor from the doorway, slightly intimidating. Or a confident person stretching at home, calm and in control. Contrast is the point.",
    viralityScore: 9,
    viralityReason:
      "Hot take format + reframe of a widely felt pain point = high comment velocity. People who agree will share it; people who disagree will comment. Both signals boost reach.",
    hashtags: ["#gymanxiety", "#fitnessforbeginners", "#workoutathome", "#gymtips", "#mentalhealthfitness", "#beginnerlifting", "#fitnessmindset"],
    cta: "Save this. You're not alone in feeling this way.",
    format: "Reel",
  },
  {
    hook: "I asked 50 people who quit working out why they stopped. Same answer every time.",
    caption:
      "I ran an informal poll last month.\n\n50 people. All had started a fitness routine. All had stopped.\n\nThe #1 reason? Not time. Not money. Not even motivation.\n\nIt was: 'I didn't see results fast enough.'\n\nHere's the truth nobody tells you: visible results take 8–12 weeks minimum. But you *feel* results in week 2.\n\nMore energy. Better sleep. Less stress. Clearer head.\n\nTrack those wins. They're real — even when the mirror lies.\n\nWhat result kept YOU going? Tell me below 👇",
    visualDescription:
      "Simple bold text graphic — dark background, bright accent color, minimal. Like a quote card but with data framing. Very shareable.",
    viralityScore: 7,
    viralityReason:
      "Data framing ('I asked 50 people') builds authority fast. The comment prompt is specific enough to generate real responses. Saves well because it reframes expectations.",
    hashtags: ["#fitnessreality", "#workoutresults", "#fitnessmotivation", "#consistencyiskey", "#fitnessjourney", "#realistfitness", "#noquit"],
    cta: "Follow for the fitness advice nobody else is giving you.",
    format: "Single image",
  },
  {
    hook: "This 5-minute morning routine is the reason I haven't missed a workout in 6 months",
    caption:
      "I used to spend 30 minutes 'getting ready' to work out.\n\nPerfect playlist. Right outfit. Optimal time.\n\nAll procrastination.\n\nNow: alarm → mat → move. 5 minutes to decide I'm doing it.\n\nThe routine:\n⏰ Alarm (no snooze)\n🥤 Glass of water immediately\n👟 Shoes on before brain wakes up\n📱 Timer set for first exercise\n💪 Start before you're ready\n\nThe secret is making the start frictionless. The workout takes care of itself.\n\nSteal this. It's yours.",
    visualDescription:
      "Flat lay of minimal morning items: glass of water, running shoes, phone with timer. Clean white background. Aesthetic but achievable.",
    viralityScore: 8,
    viralityReason:
      "Actionable micro-routine with specific steps gets saved at a very high rate. '6 months' streak signals credibility. 'Steal this' CTA reduces friction to share.",
    hashtags: ["#morningroutine", "#workoutroutine", "#fitnesshabits", "#habitbuilding", "#morningworkout", "#consistency", "#fitnesstips"],
    cta: "Save this for tomorrow morning. Try it once.",
    format: "Carousel",
  },
  {
    hook: "Nobody talks about the mental shift that happens at week 3. Let me change that.",
    caption:
      "Week 1: you're riding motivation.\nWeek 2: everything hurts and you question everything.\nWeek 3: something quietly shifts.\n\nYou stop asking 'should I work out today?' and start asking 'when am I working out today?'\n\nThat's the moment. That's the identity shift.\n\nYou're not someone who's 'trying to work out.' You're someone who works out.\n\nIf you're in week 1 or 2 right now — just get to week 3. That's the whole game.\n\nTag someone who needs to hear this.",
    visualDescription:
      "Minimalist text-based graphic or a short talking-head Reel. Authentic, unscripted feel. The message is the visual.",
    viralityScore: 9,
    viralityReason:
      "Identity-level framing ('you ARE someone who works out') is one of the highest-performing emotional triggers in habit/fitness content. Tag-a-friend CTA is highly effective here because it's genuinely useful to share.",
    hashtags: ["#identityshift", "#habitformation", "#fitnessjourney", "#week3", "#buildinghabits", "#fitnessmindset", "#motivation"],
    cta: "Tag someone who's in week 1. They need this.",
    format: "Reel",
  },
];

export async function generateIdeasMock(
  request: GenerateIdeasRequest
): Promise<GenerateIdeasResponse> {
  await sleep(MOCK_DELAY_MS);

  const platforms = request.platforms.length > 0
    ? request.platforms
    : (["instagram", "tiktok"] as Platform[]);

  const ideas: PostIdea[] = MOCK_IDEAS.map((idea, i) => ({
    ...idea,
    id: generateId(),
    platform: platforms[i % platforms.length],
    createdAt: new Date().toISOString(),
    // Slightly vary scores so cards look distinct
    viralityScore: Math.min(10, Math.max(1, idea.viralityScore + (i % 3 === 0 ? 0 : i % 3 === 1 ? -1 : 1))),
  }));

  return {
    ideas,
    sessionSummary: `${request.profile.name}'s ${request.vibe} batch: In the ${request.profile.niche} niche, content that combines personal narrative with actionable frameworks consistently outperforms generic advice. Your audience responds to vulnerability + specificity. The highest-scoring ideas this session use identity-level framing and zero-barrier entry points.`,
  };
}
