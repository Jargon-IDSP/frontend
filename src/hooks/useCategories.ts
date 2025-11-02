import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";
import type { Category, CategoriesResponse } from "../types/document";

export function useCategories() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/learning/custom/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch categories");
      }

      const response: CategoriesResponse = await res.json();
      return response.data?.categories || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
