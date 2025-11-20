import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { BACKEND_URL } from "../lib/api";

interface CustomFlashcardStatsResponse {
  success: boolean;
  data: {
    count: number;
  };
}

export function useCustomFlashcardStats() {
  const { getToken } = useAuth();

  return useQuery<number>({
    queryKey: ["customFlashcardStats"],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(
        `${BACKEND_URL}/learning/custom/terms/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch custom term stats");
      }

      const data: CustomFlashcardStatsResponse = await response.json();
      return data?.data?.count ?? 0;
    },
    staleTime: 5 * 60 * 1000,
  });
}

