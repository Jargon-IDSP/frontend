import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";

export function useDocumentCategory(documentId: string | null) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["document", documentId, "category"],
    queryFn: async (): Promise<number | null> => {
      if (!documentId) return null;

      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/documents/${documentId}/status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch document category");
      }

      const response = await res.json();
      return response.status?.categoryId || null;
    },
    enabled: !!documentId,
    staleTime: 30 * 1000,
  });
}

