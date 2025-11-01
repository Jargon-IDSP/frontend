import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { BACKEND_URL } from "../lib/api";
import { useUserPreferences } from "../hooks/useUserPreferences";
import todayTermCard from "../assets/todayTermCard.png";
import type { WordOfTheDayData, FlashcardResponse } from "@/types/wordOfTheDay";

interface WordOfTheDayProps {
  hideTitle?: boolean;
}

export default function WordOfTheDay({ hideTitle = false }: WordOfTheDayProps = {}) {
  const { getToken } = useAuth();
  const { language: userLanguage, loading: preferencesLoading } =
    useUserPreferences();
  const [loadingProgress, setLoadingProgress] = useState(0);

  const fetchRandomWord = async (): Promise<WordOfTheDayData> => {
    // Always fetch a new random word - no caching
    const token = await getToken();
    const response = await fetch(
      `${BACKEND_URL}/learning/existing/random/flashcard?language=${userLanguage}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to load random word");
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

    return wordData;
  };

  // Use TanStack Query - refetch when language changes
  const {
    data: wordData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["randomWord", userLanguage], // Include language so it refetches when language changes
    queryFn: fetchRandomWord,
    enabled: !preferencesLoading && !!userLanguage, // Only fetch when preferences are loaded
    staleTime: 0, // Always fetch fresh data - no caching
    gcTime: 0, // Don't cache - always fetch fresh
  });

  // Simulate progress while loading
  useEffect(() => {
    if (isLoading) {
      setLoadingProgress(0);
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) return prev; // Stop at 90% until data arrives
          return prev + 15; // Faster increments for quick API call
        });
      }, 150);

      return () => clearInterval(interval);
    } else if (wordData || error) {
      setLoadingProgress(100);
      // Reset after animation
      const timeout = setTimeout(() => setLoadingProgress(0), 500);
      return () => clearTimeout(timeout);
    }
  }, [isLoading, wordData, error]);

  if (preferencesLoading || isLoading) {
    return (
      <>
        {/* {!hideTitle && <h3 className="word-of-the-day-title">Random Trade Term</h3>} */}
        <div className="word-of-the-day-card">
          <img
            src={todayTermCard}
            alt="Random Trade Term"
            className="today-term-card-image"
          />
          <div className="word-card-content">
            {/* Progress Bar */}
            <div style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  width: "100%",
                  height: "6px",
                  backgroundColor: "#e5e7eb",
                  borderRadius: "9999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${loadingProgress}%`,
                    backgroundColor: "#ffba0a80",
                    transition: "width 0.3s ease-in-out",
                    borderRadius: "9999px",
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: "0.5rem",
                  textAlign: "center",
                  fontSize: "0.875rem",
                  color: "#FFFFFF",
                }}
              >
                Loading... {loadingProgress}%
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !wordData) {
    return (
      <>
        {/* {!hideTitle && <h3 className="word-of-the-day-title">Random Trade Term</h3>} */}
        <div className="word-of-the-day-card">
          <img
            src={todayTermCard}
            alt="Random Trade Term"
            className="today-term-card-image"
          />
          <div className="word-card-content">
            <div className="error-message">
              {error instanceof Error
                ? error.message
                : "Unable to load random word"}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* {!hideTitle && <h3 className="word-of-the-day-title">Random Trade Term</h3>} */}
      <div className="word-of-the-day-card">
        <img
          src={todayTermCard}
          alt="Random Trade Term"
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
