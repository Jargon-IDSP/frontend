import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";
import type { Document } from "../types/document";

interface DocumentResponse {
  document: Document;
}

export function useDocument(documentId: string | undefined) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["document", documentId],
    queryFn: async (): Promise<DocumentResponse> => {
      if (!documentId) {
        throw new Error("No document ID");
      }

      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Document not found");
      }

      return await response.json();
    },
    enabled: !!documentId,
    retry: false,
  });
}
