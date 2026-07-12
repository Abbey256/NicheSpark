export type Platform = "instagram" | "tiktok" | "linkedin" | "twitter" | "youtube";
export type Vibe = "motivational" | "educational" | "case-study" | "quick-tip" | "personal-story" | "trending" | "surprise-me";

export interface CreatorProfile {
  userId: string;
  name: string;
  niche: string;
  targetAudience: string;
  platforms: Platform[];
  voiceTone: string;
  examplePosts: string[];
  goals: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostIdea {
  id: string;
  hook: string;
  caption: string;
  visualDescription: string;
  viralityScore: number;
  viralityReason: string;
  hashtags: string[];
  cta: string;
  platform: Platform;
  format: string;
  createdAt: string;
}

export interface GenerateIdeasRequest {
  profile: CreatorProfile;
  vibe: Vibe;
  customPrompt?: string;
  platforms: Platform[];
  count?: number;
}

export interface GenerateIdeasResponse {
  ideas: PostIdea[];
  sessionSummary: string;
}

export interface IdeaSession {
  sessionId: string;
  userId: string;
  vibe: Vibe;
  ideas: PostIdea[];
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
