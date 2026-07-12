export type Platform = "instagram" | "tiktok" | "linkedin" | "twitter" | "youtube";

export type Vibe =
  | "motivational"
  | "educational"
  | "case-study"
  | "quick-tip"
  | "personal-story"
  | "trending"
  | "surprise-me";

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
  viralityScore: number; // 1–10
  viralityReason: string;
  hashtags: string[];
  cta: string;
  platform: Platform;
  format: string; // e.g. "Carousel", "Reel", "Thread"
  createdAt: string;
}

export interface GenerateIdeasRequest {
  profile: CreatorProfile;
  vibe: Vibe;
  customPrompt?: string;
  platforms: Platform[];
  count?: number; // default 7
}

export interface GenerateIdeasResponse {
  ideas: PostIdea[];
  sessionSummary: string; // AI-generated session note
}

export interface IdeaSession {
  sessionId: string;
  userId: string;
  vibe: Vibe;
  ideas: PostIdea[];
  createdAt: string;
}

export interface DashboardStats {
  totalIdeasGenerated: number;
  ideasThisWeek: number;
  currentStreak: number; // consecutive days with generated ideas
  topPerformingNiche: string;
  recentSessions: IdeaSession[];
}

// API response envelope
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
