import { useState, useEffect } from 'react';
import { useRandomFlashcard } from '../../hooks/useRandomFlashcard';
import todayTermCard from '../../assets/todayTermCard.png';
import type { FlashcardDisplayProps } from '../../types/learning';

/**
 * FlashcardDisplay - Unified component for displaying flashcards
 * Can show random flashcards from custom or prebuilt sources
 * Reusable across homepage, study pages, and anywhere else
 *
 * @example
 * // Homepage "Word of the Day" - random prebuilt flashcard
 * <FlashcardDisplay type="existing" isRandom showIndustry showLevel />
 *
 * @example
 * // Random custom flashcard from user's uploads
 * <FlashcardDisplay type="custom" isRandom />
 *
 * @example
 * // Random flashcard from specific level/industry
 * <FlashcardDisplay
 *   type="existing"
 *   isRandom
 *   levelId={2}
 *   industryId={1}
 * />
 */
export default function FlashcardDisplay({
  type,
  isRandom = false,
  documentId,
  category,
  levelId,
  industryId,
  showIndustry = true,
  showLevel = true,
}: FlashcardDisplayProps) {
  const [loadingProgress, setLoadingProgress] = useState(0);

  const {
    data: flashcard,
    isLoading,
    error,
  } = useRandomFlashcard({
    type,
    documentId,
    category,
    levelId,
    industryId,
    enabled: isRandom, // Only fetch if isRandom is true
  });

  // Simulate progress while loading
  useEffect(() => {
    if (isLoading) {
      setLoadingProgress(0);
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 15;
        });
      }, 150);

      return () => clearInterval(interval);
    } else if (flashcard || error) {
      setLoadingProgress(100);
      const timeout = setTimeout(() => setLoadingProgress(0), 500);
      return () => clearTimeout(timeout);
    }
  }, [isLoading, flashcard, error]);

  if (isLoading) {
    return (
      <>
        <h3 className="word-of-the-day-title">
          {type === "existing" ? "Today's Trade Term" : "Your Flashcard"}
        </h3>
        <div className="word-of-the-day-card">
          <img
            src={todayTermCard}
            alt="Flashcard"
            className="today-term-card-image"
          />
          <div className="word-card-content">
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

  if (error || !flashcard) {
    return (
      <>
        <h3 className="word-of-the-day-title">
          {type === "existing" ? "Today's Trade Term" : "Your Flashcard"}
        </h3>
        <div className="word-of-the-day-card">
          <img
            src={todayTermCard}
            alt="Flashcard"
            className="today-term-card-image"
          />
          <div className="word-card-content">
            <div className="error-message">
              {error instanceof Error
                ? error.message
                : type === "custom"
                ? "No custom flashcards available yet"
                : "Unable to load flashcard"}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <h3 className="word-of-the-day-title">
        {type === "existing" ? "Today's Trade Term" : "Your Flashcard"}
      </h3>
      <div className="word-of-the-day-card">
        <img
          src={todayTermCard}
          alt="Flashcard"
          className="today-term-card-image"
        />
        <div className="word-card-content">
          <div className="word-term">{flashcard.term}</div>
          {flashcard.nativeTerm && (
            <div className="word-term-translated">{flashcard.nativeTerm}</div>
          )}
          <div className="word-definition">{flashcard.definition}</div>
          {(showIndustry || showLevel) && (flashcard.industry || flashcard.level) && (
            <div className="word-meta">
              {showIndustry && flashcard.industry && (
                <span className="word-industry">{flashcard.industry}</span>
              )}
              {showLevel && flashcard.level && (
                <span className="word-level">{flashcard.level}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
