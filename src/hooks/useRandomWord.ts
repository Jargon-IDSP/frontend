import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";
import type { WordOfTheDayData, FlashcardResponse, CachedWordData } from "@/types/wordOfTheDay";

const CACHE_KEY = "wordOfTheDay";

// Get today's date in YYYY-MM-DD format (local timezone)
const getTodayDateString = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// Get cached word if it's from today
const getCachedWord = (language: string): WordOfTheDayData | null => {
  try {
    const cached = localStorage.getItem(`${CACHE_KEY}_${language}`);
    if (!cached) return null;

    const cachedData: CachedWordData = JSON.parse(cached);
    const today = getTodayDateString();

    // Return cached data only if it's from today
    if (cachedData.date === today) {
      return cachedData.data;
    }

    // Clear old cache
    localStorage.removeItem(`${CACHE_KEY}_${language}`);
    return null;
  } catch (error) {
    console.error("Error reading cached word:", error);
    return null;
  }
};

// Save word to cache with today's date
const setCachedWord = (language: string, data: WordOfTheDayData): void => {
  try {
    const cacheData: CachedWordData = {
      data,
      date: getTodayDateString(),
    };
    localStorage.setItem(`${CACHE_KEY}_${language}`, JSON.stringify(cacheData));
  } catch (error) {
    console.error("Error caching word:", error);
  }
};

export function useRandomWord(language: string, enabled: boolean = true) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["randomWord", language, getTodayDateString()], // Include date in query key
    queryFn: async (): Promise<WordOfTheDayData> => {
      // Check cache first
      const cachedWord = getCachedWord(language);
      if (cachedWord) {
        return cachedWord;
      }

      // Fetch new word
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

      const wordData: WordOfTheDayData = {
        term: englishTerm || "Unknown Term",
        definition: englishDefinition || "No definition available",
        termTranslated: translatedTerm,
        industry: flashcard.industry?.name,
        level: flashcard.level?.name,
      };

      // Cache the word for today
      setCachedWord(language, wordData);

      return wordData;
    },
    enabled,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
    retry: 2,
    retryDelay: 1000,
  });
}
