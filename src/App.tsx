import { BrowserRouter as Router, useRoutes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import { routes } from "./lib/routes";
import NavBar from "./components/NavBar";
import { useProfile } from "./hooks/useProfile";
import { NotificationProvider } from "./contexts/NotificationContext";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false, // optional: disable refetch on window focus
    },
  },
});

function AppRoutes() {
  return useRoutes(routes);
}

function ConditionalNavBar() {
  const location = useLocation();
  const { user, isLoaded: userLoaded } = useUser();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const isOnboardingPage = location.pathname.startsWith('/onboarding');
  
  // Hide navbar on onboarding pages
  if (isOnboardingPage) {
    return null;
  }
  
  // Hide navbar on home page while checking if user needs onboarding
  if (location.pathname === '/') {
    // Wait for user and profile to load
    if (!userLoaded || !user?.id || profileLoading || !profile) {
      return null;
    }
    
    // Check if user needs onboarding
    const justCompleted = sessionStorage.getItem('onboardingJustCompleted') === 'true';
    const hasSkippedThisSession = sessionStorage.getItem('onboardingSkippedThisSession') === 'true';
    const introductionViewed = profile?.introductionViewed ?? false;
    
    // Hide navbar if user needs to see introduction or onboarding
    if ((!introductionViewed || !profile.onboardingCompleted) && !hasSkippedThisSession && !justCompleted) {
      return null;
    }
  }
  
  return <NavBar />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <NotificationProvider>
          <main>
            <AppRoutes />
          </main>
          <ConditionalNavBar />
        </NotificationProvider>
      </Router>
    </QueryClientProvider>
  );
}
