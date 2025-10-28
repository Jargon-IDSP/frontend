import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { BACKEND_URL } from "../lib/api";
import { useUserPreferences } from "../hooks/useUserPreferences";
import todayTermCard from "../assets/todayTermCard.png";
import type { WordOfTheDayData, FlashcardResponse } from "@/types/wordOfTheDay";

export default function WordOfTheDay() {
  const { getToken } = useAuth();
  const { language: userLanguage, loading: preferencesLoading } =
    useUserPreferences();

  const getTodayString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // YYYY-MM-DD format
  };

  const getStoredWordForToday = (): WordOfTheDayData | null => {
    const today = getTodayString();
    const stored = localStorage.getItem("wordOfTheDay");

    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.date === today) {
          return data.word;
        }
      } catch (e) {
        // Invalid stored data, ignore
      }
    }
    return null;
  };

  const storeWordForToday = (word: WordOfTheDayData) => {
    const today = getTodayString();
    const data = {
      date: today,
      word: word,
    };
    localStorage.setItem("wordOfTheDay", JSON.stringify(data));
  };

  const fetchWordOfTheDay = async (): Promise<WordOfTheDayData> => {
    // Check if we already have a word for today
    const storedWord = getStoredWordForToday();
    if (storedWord) {
      return storedWord;
    }

    // Fetch new word from existing endpoint - fetch in user's language
    const token = await getToken();
    const response = await fetch(
      `${BACKEND_URL}/learning/existing/random/flashcard?language=${userLanguage}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to load word of the day");
    }

    const result: FlashcardResponse = await response.json();
    const flashcard = result.data;

    // Handle both flat and nested structures
    const isNestedStructure = typeof flashcard.term === "object";

    const englishTerm = isNestedStructure
      ? (flashcard.term as any).english
      : flashcard.term;

    const translatedTerm = isNestedStructure
      ? userLanguage !== "english" && (flashcard.term as any)[userLanguage]
        ? (flashcard.term as any)[userLanguage]
        : undefined
      : (flashcard as any).nativeTerm || undefined;

    const englishDefinition = isNestedStructure
      ? (flashcard.definition as any).english
      : flashcard.definition;

    const wordData: WordOfTheDayData = {
      term: englishTerm,
      definition: englishDefinition,
      termTranslated: translatedTerm,
      industry: flashcard.industry?.name,
      level: flashcard.level?.name,
    };

    // Store the word for today
    storeWordForToday(wordData);
    return wordData;
  };

  // Use TanStack Query
  const {
    data: wordData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["wordOfTheDay", getTodayString(), userLanguage],
    queryFn: fetchWordOfTheDay,
    enabled: !preferencesLoading && !!userLanguage, // Only fetch when preferences are loaded
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - word doesn't change during the day
    gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
  });

  if (preferencesLoading || isLoading) {
    return (
      <>
        <h3 className="word-of-the-day-title">Today's Trade Term</h3>
        <div className="word-of-the-day-card">
          <img
            src={todayTermCard}
            alt="Today's Trade Term"
            className="today-term-card-image"
          />
          <div className="word-card-content">
            <div className="loading-placeholder">Loading...</div>
          </div>
        </div>
      </>
    );
  }

  if (error || !wordData) {
    return (
      <>
        <h3 className="word-of-the-day-title">Today's Trade Term</h3>
        <div className="word-of-the-day-card">
          <img
            src={todayTermCard}
            alt="Today's Trade Term"
            className="today-term-card-image"
          />
          <div className="word-card-content">
            <div className="error-message">
              {error instanceof Error
                ? error.message
                : "Unable to load today's word"}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <h3 className="word-of-the-day-title">Today's Trade Term</h3>
      <div className="word-of-the-day-card">
        <img
          src={todayTermCard}
          alt="Today's Trade Term"
          className="today-term-card-image"
        />
        <div className="word-card-content">
          <div className="word-term">{wordData.term}</div>
          {wordData.termTranslated && (
            <div className="word-term-translated">
              {wordData.termTranslated}
            </div>
          )}
          <div className="word-definition">{wordData.definition}</div>
          {(wordData.industry || wordData.level) && (
            <div className="word-meta">
              {wordData.industry && (
                <span className="word-industry">{wordData.industry}</span>
              )}
              {wordData.level && (
                <span className="word-level">{wordData.level}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
