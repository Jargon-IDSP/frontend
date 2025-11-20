import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";

export function useUpdateDocumentCategory() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
      categoryId,
    }: {
      documentId: string;
      categoryId: number;
    }) => {
      const token = await getToken();
      console.log(`🔄 Updating document category: documentId=${documentId}, categoryId=${categoryId}`);
      
      const res = await fetch(`${BACKEND_URL}/documents/${documentId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoryId }),
      });

      console.log(`📡 Response status: ${res.status}`);

      if (!res.ok) {
        const error = await res.json();
        console.error(`❌ Update failed:`, error);
        throw new Error(error.error || error.message || "Failed to update document category");
      }

      const result = await res.json();
      console.log(`✅ Update successful:`, result);

      return result;
    },
    onSuccess: (_, variables) => {
      // Invalidate all relevant queries to force refresh
      queryClient.invalidateQueries({
        queryKey: ["document", variables.documentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["document", variables.documentId, "category"],
      });
      queryClient.invalidateQueries({
        queryKey: ["documents", "by-category"],
      });
      queryClient.invalidateQueries({
        queryKey: ["documents"],
      });
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
      // Refetch immediately
      queryClient.refetchQueries({
        queryKey: ["documents", "by-category"],
      });
      queryClient.refetchQueries({
        queryKey: ["categories"],
      });
    },
  });
}

