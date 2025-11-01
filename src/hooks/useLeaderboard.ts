import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
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

export function useLeaderboard(type: "general" | "friends" = "general") {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["leaderboard", type],
    queryFn: async (): Promise<User[]> => {
      const endpoint = type === "friends" ? "/leaderboard/friends" : "/leaderboard";
      const headers: HeadersInit = {};

      // Friends endpoint requires authentication
      if (type === "friends") {
        const token = await getToken();
        if (!token) {
          throw new Error("Authentication required");
        }
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${BACKEND_URL}${endpoint}`, { headers });
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
