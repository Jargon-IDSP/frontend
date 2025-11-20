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
    quickTranslation?: boolean; // Flag indicating quick cache is available (English + user's language)
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
  pollingInterval = 1000, // Reduced from 3000ms to 1000ms for faster updates
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
    refetchInterval: (query) => {
      // Stop polling when completed, otherwise poll every 1 second
      const data = query.state.data;
      return data?.status.status === 'completed' ? false : pollingInterval;
    },
    refetchIntervalInBackground: false,
    retry: false,
    staleTime: 0, // Always consider data stale to ensure fresh fetches
  });
}
