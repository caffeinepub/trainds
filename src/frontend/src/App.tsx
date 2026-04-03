import { Toaster } from "@/components/ui/sonner";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import Layout from "./components/Layout";
import ProfileSetupModal from "./components/ProfileSetupModal";
import { useCallerUserProfile, useIsAdmin } from "./hooks/useBackend";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import FeedbackPage from "./pages/FeedbackPage";
import IncidentsPage from "./pages/IncidentsPage";
import JourneyPlanner from "./pages/JourneyPlanner";
import LiveTrains from "./pages/LiveTrains";
import LoginPage from "./pages/LoginPage";
import SOSPage from "./pages/SOSPage";
import SmartFeatures from "./pages/SmartFeatures";
import TPSIScores from "./pages/TPSIScores";

function useDarkMode() {
  useEffect(() => {
    const stored = localStorage.getItem("trainds-theme") ?? "dark";
    document.documentElement.classList.add(stored);
  }, []);
}

function AppShell() {
  useDarkMode();
  const { identity, isInitializing } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useCallerUserProfile();
  const { data: isAdmin } = useIsAdmin();

  const isAuthenticated = !!identity;
  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-teal border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Loading Trainds...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const username = userProfile?.username ?? "Commuter";

  return (
    <>
      {showProfileSetup && <ProfileSetupModal open={true} />}
      <Layout username={username} isAdmin={isAdmin ?? false} />
    </>
  );
}

const rootRoute = createRootRoute({
  component: AppShell,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Dashboard,
});

const journeyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/journey",
  component: JourneyPlanner,
});

const trainsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/trains",
  component: LiveTrains,
});

const tpsiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tpsi",
  component: TPSIScores,
});

const sosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sos",
  component: SOSPage,
});

const incidentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/incidents",
  component: IncidentsPage,
});

const smartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/smart",
  component: SmartFeatures,
});

const feedbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/feedback",
  component: FeedbackPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboard,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  journeyRoute,
  trainsRoute,
  tpsiRoute,
  sosRoute,
  incidentsRoute,
  smartRoute,
  feedbackRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </>
  );
}
