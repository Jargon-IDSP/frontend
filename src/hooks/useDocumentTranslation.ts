import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";
import type { Translation } from "../types/document";

interface TranslationResponse {
  processing?: boolean;
  translation?: Translation;
  error?: string;
}

export function useDocumentTranslation(documentId: string | undefined) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["documentTranslation", documentId],
    queryFn: async (): Promise<TranslationResponse> => {
      if (!documentId) {
        throw new Error("No document ID");
      }

      const token = await getToken();
      const response = await fetch(
        `${BACKEND_URL}/documents/${documentId}/translation`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Translation not found");
      }

      return await response.json();
    },
    enabled: !!documentId,
    refetchInterval: (query) => {
      // Poll every 1 second while processing for faster updates
      return query.state.data?.processing ? 1000 : false;
    },
    refetchIntervalInBackground: false,
    retry: false,
    staleTime: 0, // Always consider data stale during processing
  });
}
