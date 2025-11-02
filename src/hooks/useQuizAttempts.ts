import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";
import type { UserQuizAttempt } from "../types/learning";

interface QuizHistoryResponse {
  attempts: UserQuizAttempt[];
}

export function useQuizAttempts(
  quizId: string | null,
  enabled: boolean = true
) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["quizAttempts", quizId],
    queryFn: async (): Promise<UserQuizAttempt[]> => {
      if (!quizId) {
        throw new Error("No quiz ID");
      }

      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/quiz/${quizId}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch quiz attempts");
      }

      const data: QuizHistoryResponse = await response.json();
      return data.attempts || [];
    },
    enabled: enabled && !!quizId,
    retry: 2,
    staleTime: 30 * 1000, 
  });
}
