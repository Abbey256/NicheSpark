/**
 * api.ts — Unified API layer.
 *
 * Priority order:
 *  1. VITE_API_URL set  → calls Lambda proxy (production)
 *  2. VITE_AWS_ACCESS_KEY_ID set → calls Bedrock directly (local dev with real AI)
 *  3. Neither set → mock data (pure offline demo)
 */
import type {
  CreatorProfile,
  GenerateIdeasRequest,
  GenerateIdeasResponse,
  ApiResponse,
  IdeaSession,
} from "@/types";
import { generateIdeasMock } from "@/lib/mockApi";
import { runFullChain, type StepCallback } from "@/lib/aiChain";

const API_BASE    = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, ""); // strip trailing slash
const HAS_LAMBDA  = !!API_BASE;
const HAS_BEDROCK = !!import.meta.env.VITE_AWS_ACCESS_KEY_ID;

export type AIMode = "lambda" | "bedrock" | "mock";

export function getAIMode(): AIMode {
  if (HAS_LAMBDA)  return "lambda";
  if (HAS_BEDROCK) return "bedrock";
  return "mock";
}

// ── HTTP helper (Lambda mode) ─────────────────────────────────────────────────
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res  = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const json: ApiResponse<T> = await res.json();
  if (!res.ok || !json.success) throw new Error(json.error ?? `Request failed: ${res.status}`);
  return json.data as T;
}

// ── Profile ───────────────────────────────────────────────────────────────────
export async function saveProfile(
  profile: Omit<CreatorProfile, "createdAt" | "updatedAt">
): Promise<CreatorProfile> {
  const now = new Date().toISOString();
  if (HAS_LAMBDA) {
    return request<CreatorProfile>("/profile", { method: "POST", body: JSON.stringify(profile) });
  }
  // Local: just echo back with timestamps
  return { ...profile, createdAt: now, updatedAt: now };
}

export async function getProfile(userId: string): Promise<CreatorProfile> {
  return request<CreatorProfile>(`/profile/${userId}`);
}

// ── Idea Generation ───────────────────────────────────────────────────────────
export async function generateIdeas(
  payload: GenerateIdeasRequest,
  onStep?: StepCallback
): Promise<GenerateIdeasResponse> {
  const mode = getAIMode();

  if (mode === "lambda") {
    return request<GenerateIdeasResponse>("/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  if (mode === "bedrock") {
    return runFullChain(payload, onStep);
  }

  // Mock fallback
  return generateIdeasMock(payload);
}

// ── History ───────────────────────────────────────────────────────────────────
export async function getHistory(userId: string): Promise<IdeaSession[]> {
  return request<IdeaSession[]>(`/history/${userId}`);
}
