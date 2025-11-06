import { BrowserRouter as Router, useRoutes, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SignedIn } from "@clerk/clerk-react";
import { routes } from "./lib/routes";
import NavBar from "./components/NavBar";

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
  const isOnboardingPage = location.pathname.startsWith('/onboarding');
  
  if (isOnboardingPage) {
    return null;
  }
  
  return <NavBar />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <main>
          <AppRoutes />
        </main>
        <SignedIn>
          <ConditionalNavBar />
        </SignedIn>
      </Router>
    </QueryClientProvider>
  );
}
