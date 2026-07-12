import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Sparkles, LayoutDashboard, Clock, Settings,
  Menu, X, Zap, ChevronRight,
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/cn";

const IS_MOCK = !import.meta.env.VITE_API_URL;

const NAV_ITEMS = [
  { to: "/app/generate",  icon: Sparkles,       label: "Generate",  description: "Spark new ideas" },
  { to: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard", description: "Stats & streaks" },
  { to: "/app/history",   icon: Clock,           label: "History",   description: "Past sessions" },
  { to: "/app/settings",  icon: Settings,        label: "Settings",  description: "Profile & prefs" },
];

export default function AppShell() {
  const { profile } = useProfile();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = profile?.name
    ? profile.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "NS";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col w-60 bg-card border-r border-border transition-transform duration-200 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Zap className="size-3.5 text-primary" />
            </div>
            <span className="text-sm font-semibold tracking-tight">NicheSpark</span>
          </div>
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* New generation CTA */}
        <div className="px-3 py-3 shrink-0">
          <Button
            className="w-full gap-2 text-xs h-8"
            onClick={() => { navigate("/app/generate"); setSidebarOpen(false); }}
          >
            <Sparkles className="size-3.5" />
            New Generation
          </Button>
        </div>

        <Separator />

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn("nav-item", isActive && "active")
              }
            >
              <Icon className="size-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <Separator />

        {/* Profile footer */}
        <div className="p-3 shrink-0">
          <div
            className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-secondary/80 cursor-pointer transition-colors group"
            onClick={() => { navigate("/app/settings"); setSidebarOpen(false); }}
          >
            {/* Avatar */}
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{profile?.name ?? "Creator"}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.niche ?? "No niche set"}</p>
            </div>
            <ChevronRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-border flex items-center gap-3 px-4 shrink-0">
          {/* Mobile menu button */}
          <button
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="size-5" />
          </button>

          {/* Breadcrumb / page title rendered by each page */}
          <div id="page-header" className="flex-1" />

          {/* Mock badge */}
          {IS_MOCK && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium cursor-default">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Mock
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Running in local mock mode — no AWS needed
              </TooltipContent>
            </Tooltip>
          )}
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
