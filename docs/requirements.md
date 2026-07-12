# NicheSpark — Requirements

## Overview
AI-powered social media content productivity coach for creators and instructors.  
Solves "What should I post?" paralysis with niche-aware, virality-optimised batch generation.

---

## Functional Requirements

### FR-1 · Creator Profile
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1.1 | User can complete a 5-step onboarding wizard collecting: name, niche, target audience, platforms, brand voice, example posts, and goals | Must |
| FR-1.2 | Profile persists in localStorage (offline MVP) and optionally DynamoDB (when API URL is set) | Must |
| FR-1.3 | Profile is editable at any time from the Settings page | Must |
| FR-1.4 | User can reset and restart onboarding | Must |

### FR-2 · Idea Generator
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-2.1 | User selects a "vibe" from 7 options: Surprise Me, Motivational, Educational, Quick Tip, Case Study, Personal Story, Trending | Must |
| FR-2.2 | User can optionally specify a custom angle prompt | Should |
| FR-2.3 | User can filter by specific platforms for the batch | Should |
| FR-2.4 | Clicking "Generate" triggers a 3-step Bedrock AI chain and returns 7 post ideas | Must |
| FR-2.5 | Each idea card displays: hook, virality score (1–10) with rationale, full caption, visual description, hashtags, CTA, platform, format | Must |
| FR-2.6 | Tabs on each card switch between Caption / Visual / Tags views | Must |
| FR-2.7 | One-click copy assembles hook + caption + CTA + hashtags and copies to clipboard | Must |
| FR-2.8 | "Refine" button per card (wand icon) — calls a follow-up Bedrock prompt: "Make more viral", "Shorten for Reels", "Add personal story" | Should |
| FR-2.9 | Ideas sorted by virality score descending | Must |
| FR-2.10 | An AI session summary is shown above the results batch | Should |

### FR-3 · Dashboard
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-3.1 | Displays: total ideas generated, ideas this week, creation streak (consecutive days), total sessions | Must |
| FR-3.2 | Shows highest-scoring idea across all sessions | Should |
| FR-3.3 | Shows creator profile summary | Should |
| FR-3.4 | Productivity tip block | Nice |

### FR-4 · History
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-4.1 | Lists all past sessions (newest first), stored in localStorage | Must |
| FR-4.2 | Each session row is expandable to show all idea hooks + scores | Must |
| FR-4.3 | Sessions capped at 20 in localStorage | Must |

### FR-5 · Productivity Guardrails
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-5.1 | Pomodoro-style 25-minute creation timer visible on Generate page | Must |
| FR-5.2 | Timer can be started, paused, and reset | Must |
| FR-5.3 | Nudge messages appear at 20 min and 25 min milestones | Should |
| FR-5.4 | Progress bar shows elapsed fraction of session | Should |

### FR-6 · Settings
| ID | Requirement | Priority |
|----|-------------|----------|
| FR-6.1 | All profile fields editable inline on Settings page | Must |
| FR-6.2 | "Save profile" persists changes | Must |
| FR-6.3 | "Reset" clears all local data and returns to onboarding | Must |

---

## Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | First meaningful paint < 1.5s on local dev |
| NFR-2 | Fully responsive — mobile sidebar collapses to hamburger |
| NFR-3 | Dark mode only (no light mode toggle for MVP) |
| NFR-4 | AWS Free Tier compatible (Lambda, DynamoDB on-demand, Amplify free tier) |
| NFR-5 | No credentials exposed to the browser — all Bedrock calls via Lambda |
| NFR-6 | localStorage fallback works with no internet / no API URL set |
| NFR-7 | TypeScript strict mode throughout |

---

## Out of Scope (MVP)

- Social media direct scheduling / publishing
- OAuth login (Cognito optional, not required for MVP)
- Paid plan / usage limits
- Mobile native app
- Real-time collaboration
