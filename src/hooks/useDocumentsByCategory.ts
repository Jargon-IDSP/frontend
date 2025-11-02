import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";
import type { QuizCategory } from "../types/document";

interface DocumentWithCategory {
  id: string;
  filename: string;
  ocrProcessed: boolean;
  category: QuizCategory;
  flashcardCount: number;
  questionCount: number;
}

export function useDocumentsByCategory(category: QuizCategory | string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["documents", "by-category", category],
    queryFn: async (): Promise<DocumentWithCategory[]> => {
      const token = await getToken();
      const res = await fetch(
        `${BACKEND_URL}/learning/custom/quizzes/by-category/${category.toUpperCase()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch documents by category");
      }

      const response = await res.json();
      return response.data?.documents || [];
    },
    staleTime: 30 * 1000,
    retry: 2,
  });
}
