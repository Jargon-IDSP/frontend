import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";
import { useUserPreferences } from "./useUserPreferences";
import { formatFlashcardWithLanguage } from "../utils/languageUtils";
import type { Term, UseRandomFlashcardOptions, ApiResponse } from "../types/learning";

export function useRandomFlashcard(options: UseRandomFlashcardOptions) {
  const { type, documentId, category, levelId, industryId, enabled = true } = options;
  const { getToken } = useAuth();
  const { language } = useUserPreferences();

  return useQuery({
    queryKey: ["randomFlashcard", type, documentId, category, levelId, industryId, language],
    queryFn: async (): Promise<Term> => {
      const token = await getToken();

      let url: string;
      const params = new URLSearchParams();
      params.set("language", language);

      if (type === "custom") {
        url = `${BACKEND_URL}/learning/custom/random/flashcard`;
      } else {
        url = `${BACKEND_URL}/learning/existing/random/flashcard`;

        if (levelId) params.set("level_id", levelId.toString());
        if (industryId) params.set("industry_id", industryId.toString());
      }

      const response = await fetch(`${url}?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch random ${type} flashcard`);
      }

      const result: ApiResponse<any> = await response.json();

      return formatFlashcardWithLanguage(result.data, language);
    },
    enabled,
    staleTime: type === "existing" ? 24 * 60 * 60 * 1000 : 5 * 60 * 1000, 
    retry: 2,
  });
}
