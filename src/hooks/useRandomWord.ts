import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";
import type { WordOfTheDayData, FlashcardResponse } from "@/types/wordOfTheDay";

export function useRandomWord(language: string, enabled: boolean = true) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["randomWord", language],
    queryFn: async (): Promise<WordOfTheDayData> => {
      const token = await getToken();
      const response = await fetch(
        `${BACKEND_URL}/learning/existing/random/flashcard?language=${language}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Random word API error:", response.status, errorText);
        throw new Error(`Failed to load random word: ${response.status}`);
      }

      const result: FlashcardResponse = await response.json();
      const flashcard = result.data;

      if (!flashcard) {
        throw new Error("No flashcard data returned");
      }

      // Handle both nested and flat structures
      const isNestedStructure = typeof flashcard.term === "object";

      const englishTerm = isNestedStructure
        ? (flashcard.term as any).english
        : flashcard.term;

      const translatedTerm = isNestedStructure
        ? language !== "english" && (flashcard.term as any)[language]
          ? (flashcard.term as any)[language]
          : undefined
        : (flashcard as any).nativeTerm || undefined;

      const englishDefinition = isNestedStructure
        ? (flashcard.definition as any).english
        : flashcard.definition;

      return {
        term: englishTerm || "Unknown Term",
        definition: englishDefinition || "No definition available",
        termTranslated: translatedTerm,
        industry: flashcard.industry?.name,
        level: flashcard.level?.name,
      };
    },
    enabled,
    staleTime: 0, // Always fetch fresh
    gcTime: 0, // Don't cache
    retry: 2,
    retryDelay: 1000,
  });
}
