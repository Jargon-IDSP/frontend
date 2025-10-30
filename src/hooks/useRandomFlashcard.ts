import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";
import { useUserPreferences } from "./useUserPreferences";
import { formatFlashcardWithLanguage } from "../utils/languageUtils";
import type { Term, UseRandomFlashcardOptions, ApiResponse } from "../types/learning";

/**
 * Unified hook for fetching random flashcards from either custom or prebuilt sources
 * Automatically handles language preferences and data formatting
 *
 * @example
 * // Random prebuilt flashcard (homepage "Word of the Day")
 * const { data } = useRandomFlashcard({ type: "existing" });
 *
 * @example
 * // Random custom flashcard from specific document
 * const { data } = useRandomFlashcard({
 *   type: "custom",
 *   documentId: "abc123"
 * });
 *
 * @example
 * // Random prebuilt flashcard for specific level/industry
 * const { data } = useRandomFlashcard({
 *   type: "existing",
 *   levelId: 2,
 *   industryId: 1
 * });
 */
export function useRandomFlashcard(options: UseRandomFlashcardOptions) {
  const { type, documentId, category, levelId, industryId, enabled = true } = options;
  const { getToken } = useAuth();
  const { language } = useUserPreferences();

  return useQuery({
    queryKey: ["randomFlashcard", type, documentId, category, levelId, industryId, language],
    queryFn: async (): Promise<Term> => {
      const token = await getToken();

      // Build URL based on type and filters
      let url: string;
      const params = new URLSearchParams();
      params.set("language", language);

      if (type === "custom") {
        // Random from all custom flashcards
        // Note: Backend doesn't currently support filtering by documentId/category for random
        // This would need to be added to backend if needed
        url = `${BACKEND_URL}/learning/custom/random/flashcard`;
      } else {
        // Prebuilt (existing) flashcards
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

      // Format the flashcard with language support
      return formatFlashcardWithLanguage(result.data, language);
    },
    enabled,
    staleTime: type === "existing" ? 24 * 60 * 60 * 1000 : 5 * 60 * 1000, // 24h for existing, 5min for custom
    retry: 2,
  });
}
