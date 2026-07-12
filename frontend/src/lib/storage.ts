/**
 * Local storage helpers — used as a fallback / offline cache
 * so the app still works during demo without hitting DynamoDB.
 */
import type { CreatorProfile, IdeaSession } from "@/types";

const PROFILE_KEY = "nichespark:profile";
const SESSIONS_KEY = "nichespark:sessions";

export function loadLocalProfile(): CreatorProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as CreatorProfile) : null;
  } catch {
    return null;
  }
}

export function saveLocalProfile(profile: CreatorProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadLocalSessions(): IdeaSession[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    return raw ? (JSON.parse(raw) as IdeaSession[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalSession(session: IdeaSession): void {
  const sessions = loadLocalSessions();
  sessions.unshift(session); // newest first
  // keep last 20 sessions in local storage
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions.slice(0, 20)));
}

export function clearLocalData(): void {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(SESSIONS_KEY);
}
