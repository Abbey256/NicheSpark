import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { CreatorProfile } from "@/types";
import { loadLocalProfile, saveLocalProfile } from "@/lib/storage";

interface ProfileContextValue {
  profile: CreatorProfile | null;
  setProfile: (p: CreatorProfile) => void;
  clearProfile: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<CreatorProfile | null>(
    () => loadLocalProfile()
  );

  const setProfile = useCallback((p: CreatorProfile) => {
    saveLocalProfile(p);
    setProfileState(p);
  }, []);

  const clearProfile = useCallback(() => {
    setProfileState(null);
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, clearProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside ProfileProvider");
  return ctx;
}
