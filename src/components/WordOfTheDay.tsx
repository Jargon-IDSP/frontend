import { useAuth } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { useUserPreferences } from "../hooks/useUserPreferences";
import { useRandomWord } from "../hooks/useRandomWord";
import todayTermCard from "../assets/todayTermCard.svg";
import "../styles/components/_wordOfTheDay.scss";

export default function WordOfTheDay() {
  const { isSignedIn, isLoaded } = useAuth();
  const { language: userLanguage, loading: preferencesLoading } =
    useUserPreferences();
  const [loadingProgress, setLoadingProgress] = useState(0);

  const {
    data: wordData,
    isLoading,
    error,
    refetch,
  } = useRandomWord(
    userLanguage,
    isLoaded && isSignedIn && !preferencesLoading && !!userLanguage
  );

  // Loading progress animation
  useEffect(() => {
    if (isLoading) {
      setLoadingProgress(0);
      const interval = setInterval(() => {
        setLoadingProgress((prev) => (prev >= 90 ? prev : prev + 15));
      }, 150);
      return () => clearInterval(interval);
    } else if (wordData || error) {
      setLoadingProgress(100);
      const timeout = setTimeout(() => setLoadingProgress(0), 500);
      return () => clearTimeout(timeout);
    }
  }, [isLoading, wordData, error]);

  // Loading state - auth or preferences loading
  if (!isLoaded || preferencesLoading) {
    return (
      <div className="word-of-the-day-card">
        <img
          src={todayTermCard}
          alt="Random Trade Term"
          className="today-term-card-image"
        />
        <div className="word-card-content">
          <div className="word-of-the-day-card__loading">
            <div className="word-of-the-day-card__progress-track">
              <div
                className="word-of-the-day-card__progress-fill"
                style={{ width: "50%" }}
              />
            </div>
            <div className="word-of-the-day-card__progress-text">
              Initializing...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!isSignedIn) {
    return (
      <div className="word-of-the-day-card">
        <img
          src={todayTermCard}
          alt="Random Trade Term"
          className="today-term-card-image"
        />
        <div className="word-card-content">
          <div className="error-message">
            Please sign in to view trade terms
          </div>
        </div>
      </div>
    );
  }

  // Loading state - fetching word
  if (isLoading) {
    return (
      <div className="word-of-the-day-card">
        <img
          src={todayTermCard}
          alt="Random Trade Term"
          className="today-term-card-image"
        />
        <div className="word-card-content">
          <div className="word-of-the-day-card__loading">
            <div className="word-of-the-day-card__progress-track">
              <div
                className="word-of-the-day-card__progress-fill"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <div className="word-of-the-day-card__progress-text">
              Loading... {loadingProgress}%
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
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

  // No data
  if (!wordData) {
    return (
      <div className="word-of-the-day-card">
        <img
          src={todayTermCard}
          alt="Random Trade Term"
          className="today-term-card-image"
        />
        <div className="word-card-content">
          <div className="error-message">No term available</div>
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
            Load Term
          </button>
        </div>
      </div>
    );
  }

  // Success - show the word
  return (
    <div className="word-of-the-day-card">
      <img
        src={todayTermCard}
        alt="Random Trade Term"
        className="today-term-card-image"
      />
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
        {/* <button
          onClick={() => refetch()}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Get New Term
        </button> */}
      </div>
    </div>
  );
}
