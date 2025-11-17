import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "@/lib/api";

export interface WeeklyPlacement {
  weekStartDate: string;
  weekEndDate: string;
  rank: number | null;
  weeklyScore: number;
}

export interface SelfLeaderboardData {
  medals: {
    gold: number;
    silver: number;
    bronze: number;
  };
  placements: WeeklyPlacement[];
}

interface SelfLeaderboardResponse {
  success: boolean;
  data: SelfLeaderboardData;
  message?: string;
}

export function useSelfLeaderboard(weeksBack: number = 12) {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["selfLeaderboard", weeksBack],
    queryFn: async (): Promise<SelfLeaderboardData> => {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const response = await fetch(
        `${BACKEND_URL}/weekly-tracking/self?weeks=${weeksBack}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = "Failed to fetch self leaderboard";
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${errorText || errorMessage}`;
        }
        throw new Error(errorMessage);
      }

      const result: SelfLeaderboardResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || "Failed to fetch self leaderboard");
      }
      
      return result.data;
    },
    enabled: !!isSignedIn,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

