import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import type { Badge } from "../types/badge";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export function useAvailableBadges() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["availableBadges"],
    queryFn: async (): Promise<Badge[]> => {
      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/prebuilt-quizzes/available-badges`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch available badges");
      }

      const data = await response.json();
      return data.badges || [];
    },
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - badges rarely change
  });
}
