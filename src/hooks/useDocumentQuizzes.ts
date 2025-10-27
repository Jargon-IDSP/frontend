import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";
import type { CustomQuiz } from "../types/learning";

interface QuizzesResponse {
  data: CustomQuiz[];
}

export function useDocumentQuizzes(
  documentId: string | undefined,
  enabled: boolean = true
) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["documentQuizzes", documentId],
    queryFn: async (): Promise<CustomQuiz[]> => {
      if (!documentId) {
        throw new Error("No document ID");
      }

      const token = await getToken();
      const response = await fetch(
        `${BACKEND_URL}/learning/documents/${documentId}/quizzes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch quizzes");
      }

      const data: QuizzesResponse = await response.json();
      return data.data || [];
    },
    enabled: enabled && !!documentId,
    retry: 2,
  });
}
