import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";
import type { QuizQuestion } from "../types/learning";

interface CategoryQuestionsResponse {
  data: QuizQuestion[];
}

export function useCategoryQuestions(
  category: string | undefined,
  language: string = "english"
) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["categoryQuestions", category, language],
    queryFn: async (): Promise<QuizQuestion[]> => {
      if (!category) {
        throw new Error("No category provided");
      }

      const token = await getToken();
      const url = `${BACKEND_URL}/learning/custom/categories/${category}/questions?language=${language}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch category questions");
      }

      const data: CategoryQuestionsResponse = await response.json();
      return data.data || [];
    },
    enabled: !!category,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
