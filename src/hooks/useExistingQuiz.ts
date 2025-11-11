import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";
import type { QuizQuestion } from "../types/learning";

interface QuizResponse {
  data: QuizQuestion[];
}

export function useExistingQuiz(
  levelId: string | undefined,
  quizNumber: number = 1,
  industryId?: string,
  language: string = "english"
) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["existingQuiz", levelId, quizNumber, industryId, language],
    queryFn: async (): Promise<QuizQuestion[]> => {
      if (!levelId) {
        throw new Error("No level ID provided");
      }

      // Validate quiz number (only 1-3 exist)
      if (quizNumber < 1 || quizNumber > 3) {
        throw new Error(`Invalid quiz number: ${quizNumber}. Only quizzes 1-3 are available.`);
      }

      const token = await getToken();

      let url = `${BACKEND_URL}/learning/existing/levels/${levelId}/quiz/generate?quiz_number=${quizNumber}&language=${language}`;
      if (industryId) {
        url += `&industry_id=${industryId}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch quiz");
      }

      const data: QuizResponse = await response.json();
      return data.data || [];
    },
    enabled: !!levelId,
    retry: 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
