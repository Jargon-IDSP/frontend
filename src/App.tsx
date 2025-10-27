import { BrowserRouter as Router, useRoutes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <NavBar />
        <AppRoutes />
      </Router>
    </QueryClientProvider>
  );
}
