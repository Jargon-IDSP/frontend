import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "@/lib/api";
import type { Level, LevelsResponse } from "@/types/level";

const DEFAULT_LEVELS: Level[] = [
  { id: 1, name: "Foundation", completed: false, unlocked: true },
  { id: 2, name: "Intermediate", completed: false, unlocked: false },
  { id: 3, name: "Advanced", completed: false, unlocked: false },
];

export function useLevels(industryId?: number | null) {
  const { getToken, isSignedIn, isLoaded } = useAuth();

  return useQuery({
    queryKey: ["levels", industryId ?? undefined],
    queryFn: async (): Promise<Level[]> => {
      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/learning/existing/levels`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch levels");
      }

      const result: LevelsResponse = await response.json();
      return result.data || DEFAULT_LEVELS;
    },
    enabled: isLoaded && isSignedIn,
    staleTime: 0, // Don't cache - always fetch fresh to get accurate level accessibility
    retry: 2,
  });
}

export type { Level };
