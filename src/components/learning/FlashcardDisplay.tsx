import { useState, useEffect } from 'react';
import { useRandomFlashcard } from '../../hooks/useRandomFlashcard';
import todayTermCard from '../../assets/todayTermCard.png';
import type { FlashcardDisplayProps } from '../../types/learning';
import '../../styles/pages/_homepage.scss';

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
    enabled: isRandom,
  });

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
            <div className="flashcard-loading">
              <div className="flashcard-loading__bar-container">
                <div
                  className="flashcard-loading__bar-fill"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <div className="flashcard-loading__text">
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
