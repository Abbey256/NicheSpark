import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProfileProvider } from "@/hooks/useProfile";
import { ToastProvider } from "@/hooks/useToast";
import AppShell from "@/components/AppShell";
import LandingPage from "@/pages/LandingPage";
import OnboardingPage from "@/pages/OnboardingPage";
import GeneratePage from "@/pages/GeneratePage";
import DashboardPage from "@/pages/DashboardPage";
import HistoryPage from "@/pages/HistoryPage";
import SettingsPage from "@/pages/SettingsPage";
import { loadLocalProfile } from "@/lib/storage";

function RequireProfile({ children }: { children: React.ReactNode }) {
  const profile = loadLocalProfile();
  if (!profile) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <TooltipProvider delayDuration={300}>
      <ProfileProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />

              {/* App — requires profile */}
              <Route
                path="/app"
                element={
                  <RequireProfile>
                    <AppShell />
                  </RequireProfile>
                }
              >
                <Route index element={<Navigate to="/app/generate" replace />} />
                <Route path="generate"  element={<GeneratePage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="history"   element={<HistoryPage />} />
                <Route path="settings"  element={<SettingsPage />} />
              </Route>

              {/* Legacy /generate redirect */}
              <Route path="/generate"  element={<Navigate to="/app/generate" replace />} />
              <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
              <Route path="*"          element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </ProfileProvider>
    </TooltipProvider>
  );
}
