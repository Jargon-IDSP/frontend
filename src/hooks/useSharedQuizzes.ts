import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";
import type { SharedQuiz } from "../types/learning";

interface SharedResponse {
  data: SharedQuiz[];
}

export function useSharedQuizzes(enabled: boolean = true) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["sharedQuizzes"],
    queryFn: async (): Promise<SharedQuiz[]> => {
      const token = await getToken();
      const response = await fetch(
        `${BACKEND_URL}/learning/sharing/shared-with-me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch shared quizzes");
      }

      const data: SharedResponse = await response.json();
      return data.data || [];
    },
    enabled,
    retry: false,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Re-export the type for convenience
export type { SharedQuiz };
