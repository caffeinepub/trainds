import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  AlertTriangle,
  BarChart2,
  Bell,
  ChevronRight,
  LayoutDashboard,
  Map as MapIcon,
  Menu,
  MessageSquare,
  Moon,
  Shield,
  Star,
  Sun,
  Train,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "../hooks/useTheme";
import { cn } from "../utils/helpers";
import SOSModal from "./SOSModal";

interface LayoutProps {
  username: string;
  isAdmin: boolean;
}

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/journey", icon: MapIcon, label: "Journey Planner" },
  { to: "/trains", icon: Train, label: "Live Trains" },
  { to: "/tpsi", icon: BarChart2, label: "TPSI Scores" },
  { to: "/sos", icon: AlertTriangle, label: "SOS Emergency", danger: true },
  { to: "/incidents", icon: MessageSquare, label: "Incidents" },
  { to: "/smart", icon: Zap, label: "Smart Features" },
  { to: "/feedback", icon: Star, label: "Feedback" },
];

const adminNavItem = { to: "/admin", icon: Shield, label: "Admin" };

export default function Layout({ username, isAdmin }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const allNavItems = isAdmin ? [...navItems, adminNavItem] : navItems;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: overlay closes on click
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-64 flex-col transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{
          background:
            "linear-gradient(180deg, oklch(0.17 0.028 248) 0%, oklch(0.14 0.022 250) 100%)",
          borderRight: "1px solid oklch(1 0 0 / 8%)",
        }}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-white/5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/20 text-teal border border-teal/30">
            <Train className="h-4 w-4" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">
            Trainds
          </span>
          <button
            type="button"
            className="ml-auto lg:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {allNavItems.map((item) => {
              const isActive = location.pathname === item.to;
              const isDanger = (item as any).danger;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  data-ocid={`nav.${item.label.toLowerCase().replace(/ /g, "_")}.link`}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? isDanger
                        ? "bg-red-500/20 text-red-300"
                        : "bg-teal/15 text-teal-bright"
                      : isDanger
                        ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        : "text-sidebar-foreground/70 hover:bg-white/5 hover:text-sidebar-foreground",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 flex-shrink-0",
                      isActive && !isDanger && "text-teal",
                    )}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <ChevronRight className="ml-auto h-3 w-3 opacity-50" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* SOS quick button */}
        <div className="p-3 border-t border-white/5">
          <button
            type="button"
            onClick={() => setSosOpen(true)}
            data-ocid="sos.open_modal_button"
            className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 animate-pulse-sos"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.35 0.12 27) 0%, oklch(0.45 0.18 27) 100%)",
              border: "1px solid oklch(0.5 0.18 27 / 50%)",
              color: "oklch(0.90 0.05 27)",
            }}
          >
            <AlertTriangle className="h-4 w-4" />
            Emergency SOS
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header
          className="flex h-16 items-center gap-4 px-4 lg:px-6 border-b border-white/5"
          style={{ background: "oklch(0.155 0.025 248)" }}
        >
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">
              Welcome back, <span className="text-teal">{username}</span>!
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={toggleTheme}
              data-ocid="topbar.toggle"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              data-ocid="topbar.bell.button"
            >
              <Bell className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-muted-foreground sm:block">
                {username}
              </span>
              <Avatar className="h-8 w-8 border border-white/10">
                <AvatarFallback className="bg-teal/20 text-teal text-xs font-medium">
                  {username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating SOS button */}
      <button
        type="button"
        onClick={() => setSosOpen(true)}
        data-ocid="sos.open_modal_button"
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full shadow-sos transition-transform hover:scale-110 active:scale-95 lg:hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.45 0.18 27) 0%, oklch(0.55 0.22 27) 100%)",
          border: "2px solid oklch(0.6 0.22 27 / 60%)",
        }}
      >
        <AlertTriangle className="h-6 w-6 text-white" />
      </button>

      <SOSModal open={sosOpen} onClose={() => setSosOpen(false)} />
    </div>
  );
}
