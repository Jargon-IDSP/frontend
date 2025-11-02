import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";
import type { QuizCategory } from "../types/document";

interface DocumentStatusResponse {
  status: {
    status: "processing" | "completed" | "error";
    hasTranslation: boolean;
    hasFlashcards: boolean;
    hasQuiz: boolean;
    flashcardCount: number;
    questionCount: number;
    category: QuizCategory | null;
  };
  document: {
    id: string;
    filename: string;
  };
}

interface UseDocumentProcessingStatusOptions {
  documentId: string | null;
  pollingInterval?: number;
}

export function useDocumentProcessingStatus({
  documentId,
  pollingInterval = 3000,
}: UseDocumentProcessingStatusOptions) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["documentProcessingStatus", documentId],
    queryFn: async (): Promise<DocumentStatusResponse> => {
      if (!documentId) {
        throw new Error("No document ID");
      }

      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/documents/${documentId}/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch document status");
      }

      return await res.json();
    },
    enabled: !!documentId,
    refetchInterval: pollingInterval,
    refetchIntervalInBackground: false,
    retry: false,
  });
}
