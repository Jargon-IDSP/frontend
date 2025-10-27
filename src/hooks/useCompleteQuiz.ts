import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";

interface QuizCompletePayload {
  type: "custom" | "existing";
  score: number;
  totalQuestions: number;
  category?: string;
  quizId?: string;
  levelId?: number;
}

export function useCompleteQuiz() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: QuizCompletePayload) => {
      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/learning/quiz/complete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save quiz results");
      }

      return await response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate quiz attempts cache
      if (variables.quizId) {
        queryClient.invalidateQueries({
          queryKey: ["quizAttempts", variables.quizId],
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
