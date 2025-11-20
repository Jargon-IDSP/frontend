import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";

interface QuizAttempt {
  id: string;
  userId: string;
  prebuiltQuizId: string;
  levelId: number | null;
  questionsAnswered: number;
  questionsCorrect: number;
  totalQuestions: number;
  percentComplete: number;
  percentCorrect: number;
  pointsEarned: number;
  maxPossiblePoints: number;
  completed: boolean;
  startedAt: Date;
  completedAt: Date | null;
}

interface QuizAttemptResponse {
  attempt: QuizAttempt | null;
}

export function usePrebuiltQuizAttempt(prebuiltQuizId: string | undefined) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["prebuiltQuizAttempt", prebuiltQuizId],
    queryFn: async (): Promise<QuizAttempt | null> => {
      const token = await getToken();
      const response = await fetch(
        `${BACKEND_URL}/prebuilt-quizzes/${prebuiltQuizId}/attempt`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch quiz attempt");
      }

      const data: QuizAttemptResponse = await response.json();
      return data.attempt;
    },
    enabled: !!prebuiltQuizId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
