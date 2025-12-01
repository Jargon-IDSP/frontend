import { useAuth } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserPreferences } from "../hooks/useUserPreferences";
import { useRandomWord } from "../hooks/useRandomWord";
import type { WordOfTheDayProps } from "../types/wordOfTheDay";
import todayTermCard from "../assets/todayTermCard.svg";
import "../styles/components/_wordOfTheDay.scss";

export default function WordOfTheDay({ 
  documentId, 
  backgroundImage, 
  backgroundColor, 
  showButton = false,
  onReady
}: WordOfTheDayProps & { onReady?: () => void } = {}) {
  const cardBackground = backgroundImage || todayTermCard;
  const useColorBg = !!backgroundColor;
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const { language: userLanguage, loading: preferencesLoading } =
    useUserPreferences();

  const {
    data: wordData,
    isLoading,
    error,
    refetch,
  } = useRandomWord(
    userLanguage,
    isLoaded && isSignedIn && !preferencesLoading && !!userLanguage
  );

  useEffect(() => {
    if (onReady && isLoaded && !preferencesLoading && !isLoading && wordData) {
      onReady();
    }
  }, [onReady, isLoaded, preferencesLoading, isLoading, wordData]);

  const handleCardClick = () => {
    if (documentId) {
      navigate(`/learning/documents/${documentId}/flashcards`);
      return;
    }

    if (userLanguage) {
      localStorage.removeItem(`wordOfTheDay_${userLanguage}`);
    }
    refetch();
  };

  if (!isLoaded || preferencesLoading || isLoading || !wordData) {
    return null;
  }

  if (!isSignedIn) {
    return (
      <div className="word-of-the-day-card">
        {useColorBg ? (
          <div
            className="word-of-the-day-card__background"
            style={{ backgroundColor }}
          />
        ) : (
          <img
            src={cardBackground}
            alt="Random Trade Term"
            className="today-term-card-image"
          />
        )}
        <div className="word-card-content">
          <div className="error-message">
            Please sign in to view trade terms
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="word-of-the-day-card">
        {useColorBg ? (
          <div
            className="word-of-the-day-card__background"
            style={{ backgroundColor }}
          />
        ) : (
          <img
            src={cardBackground}
            alt="Random Trade Term"
            className="today-term-card-image"
          />
        )}
        <div className="word-card-content">
          <div className="error-message">
            {error instanceof Error
              ? error.message
              : "Unable to load random word"}
          </div>
          <button
            onClick={() => refetch()}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="word-of-the-day-card"
      onClick={documentId ? undefined : handleCardClick}
      style={{ cursor: documentId ? "default" : "pointer" }}
    >
      {useColorBg ? (
        <div
          className="word-of-the-day-card__background"
          style={{ backgroundColor }}
        />
      ) : (
        <img
          src={cardBackground}
          alt="Random Trade Term"
          className="today-term-card-image"
        />
      )}
      <div className="word-card-content">
        <div className="word-term">{wordData.term}</div>
        {wordData.termTranslated && (
          <div className="word-term-translated">{wordData.termTranslated}</div>
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
        {(documentId || showButton) && (
          <button
            className="word-start-learning-btn"
            onClick={documentId ? handleCardClick : undefined}
          >
            Start Learning
          </button>
        )}
      </div>
    </div>
  );
}
