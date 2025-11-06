import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "@/lib/api";

interface Level {
  id: number;
  name: string;
  completed: boolean;
}

interface LevelsResponse {
  data: Level[];
}

const DEFAULT_LEVELS: Level[] = [
  { id: 1, name: "Foundation", completed: false },
  { id: 2, name: "Intermediate", completed: false },
  { id: 3, name: "Advanced", completed: false },
];

export function useLevels(industryId?: number | null) {
  // ← Accept null
  const { getToken, isSignedIn, isLoaded } = useAuth();

  return useQuery({
    queryKey: ["levels", industryId ?? undefined], // ← Convert null to undefined for cache key
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

export type { Level };
