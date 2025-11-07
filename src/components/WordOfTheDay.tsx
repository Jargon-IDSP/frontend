import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useUserPreferences } from "../hooks/useUserPreferences";
import { useRandomWord } from "../hooks/useRandomWord";
import todayTermCard from "../assets/todayTermCard.svg";
import "../styles/components/_wordOfTheDay.scss";
import LoadingBar from "./LoadingBar";
import type { WordOfTheDayProps } from "../types/wordOfTheDay";

export default function WordOfTheDay({ navigateTo = "/learning" }: WordOfTheDayProps) {
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

  // Only show loading when query is actually enabled and running
  const shouldShowLoading = isLoaded && isSignedIn && !preferencesLoading && !!userLanguage && isLoading;

  // Loading state - auth or preferences loading
  if (!isLoaded || preferencesLoading) {
    return (
      <div className="word-of-the-day-card word-of-the-day-card--loading">
        <img
          src={todayTermCard}
          alt="Random Trade Term"
          className="today-term-card-image"
        />
        <div className="word-card-content">
          <LoadingBar isLoading={true} text="Initializing" />
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
  if (shouldShowLoading) {
    return (
      <div className="word-of-the-day-card">
        <img
          src={todayTermCard}
          alt="Random Trade Term"
          className="today-term-card-image"
        />
        <div className="word-card-content">
          <LoadingBar isLoading={true} hasData={!!wordData} hasError={!!error} />
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
    <div className="word-of-the-day-card" onClick={() => navigate(navigateTo)} style={{ cursor: "pointer" }}>
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
