import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";
import type { Document } from "../types/document";

interface DocumentsResponse {
  documents: Document[];
}

export function useDocuments(refresh?: number) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["documents", refresh],
    queryFn: async (): Promise<Document[]> => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch documents");
      }

      const data: DocumentsResponse = await res.json();
      return data.documents || [];
    },
    staleTime: 30 * 1000,
    retry: 2,
  });
}
