import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";

interface ExistingQuizCompletePayload {
  type: "existing";
  score: number;
  totalQuestions: number;
  levelId: string | number;
  industryId?: number;
  quizId: string;
}

export function useCompleteExistingQuiz() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ExistingQuizCompletePayload) => {
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["existingQuiz", variables.levelId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["quizAttempts"] });
    },
    onError: (error: Error) => {
      console.error("Error saving quiz results:", error);
    },
  });
}
