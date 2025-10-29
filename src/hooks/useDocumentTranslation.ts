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
      // Poll every 3 seconds if processing, otherwise don't poll
      return query.state.data?.processing ? 3000 : false;
    },
    refetchIntervalInBackground: false,
    retry: false,
  });
}
