import { useQuery } from "@tanstack/react-query";
import { BACKEND_URL } from "../lib/api";

export interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  score: number;
  language: string | null;
}

interface LeaderboardResponse {
  success: boolean;
  data: User[];
  message?: string;
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async (): Promise<User[]> => {
      const response = await fetch(`${BACKEND_URL}/leaderboard`);
      const data: LeaderboardResponse = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch leaderboard");
      }

      return data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}
