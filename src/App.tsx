import { BrowserRouter as Router, useRoutes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-react";
import { routes } from "./lib/routes";
import NavBar from "./components/NavBar";
import ScrollToTop from "./components/ScrollToTop";
import { useProfile } from "./hooks/useProfile";
import { NotificationProvider } from "./contexts/NotificationContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, 
      refetchOnWindowFocus: false, 
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
  
  if (isOnboardingPage) {
    return null;
  }
  
  if (location.pathname === '/') {
    if (!userLoaded || !user?.id || profileLoading || !profile) {
      return null;
    }
    
    const justCompleted = sessionStorage.getItem('onboardingJustCompleted') === 'true';
    const hasSkippedThisSession = sessionStorage.getItem('onboardingSkippedThisSession') === 'true';
    const introductionViewed = profile?.introductionViewed ?? false;
    
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
        <ScrollToTop />
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
