import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";

interface QuizCompletePayload {
  type: "custom" | "existing";
  score: number;
  totalQuestions: number;
  quizId?: string;
  levelId?: number;
  category?: string;
}

export function useCompleteQuizAttempt() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: QuizCompletePayload) => {
      const token = await getToken();
      const response = await fetch(
        `${BACKEND_URL}/learning/attempts/complete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save quiz results");
      }

      return await response.json();
    },
    onSuccess: (_data, variables) => {
      // ← Changed 'data' to '_data' to indicate it's intentionally unused
      // Invalidate quiz attempts cache
      if (variables.quizId) {
        queryClient.invalidateQueries({
          queryKey: ["quizAttempts", variables.quizId],
        });
        queryClient.invalidateQueries({
          queryKey: ["customQuiz", variables.quizId],
        });
      }
      // Invalidate category quiz cache if applicable
      if (variables.category) {
        queryClient.invalidateQueries({
          queryKey: ["categoryQuestions", variables.category],
        });
      }
    },
    onError: (error: Error) => {
      console.error("Error saving quiz results:", error);
    },
  });
}
