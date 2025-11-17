import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";

interface PrebuiltQuiz {
  id: string;
  templateId: string;
  levelId: number;
  industryId: number | null;
  quizNumber: number;
  quizType: string;
  questionsPerQuiz: number;
  pointsPerQuestion: number;
  passingScore: number | null;
}

export function usePrebuiltQuizzes(levelId: number | undefined, industryId: number | undefined) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["prebuiltQuizzes", levelId, industryId],
    queryFn: async (): Promise<PrebuiltQuiz[]> => {
      const token = await getToken();
      const response = await fetch(
        `${BACKEND_URL}/prebuilt-quizzes/levels/${levelId}/industry/${industryId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch prebuilt quizzes");
      }

      const data = await response.json();
      return data.quizzes || [];
    },
    enabled: !!levelId && !!industryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
