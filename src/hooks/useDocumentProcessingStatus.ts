import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";

interface DocumentStatusResponse {
  document: {
    id: string;
    ocrProcessed: boolean;
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
      const res = await fetch(`${BACKEND_URL}/documents/${documentId}`, {
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
