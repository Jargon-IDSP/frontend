import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { BACKEND_URL } from "../../lib/api";
import type { Translation } from "../../types/document";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import DocumentNav from "../../components/DocumentNav";

interface TranslationResponse {
  processing?: boolean;
  translation?: Translation;
  error?: string;
}

export default function FullTranslationView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { language: userLanguage } = useUserPreferences();

  // Fetch translation with smart polling
  const {
    data,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["documentTranslation", id],
    queryFn: async (): Promise<TranslationResponse> => {
      const token = await getToken();

      const translationRes = await fetch(
        `${BACKEND_URL}/documents/${id}/translation`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!translationRes.ok) {
        const errorData = await translationRes.json();
        throw new Error(errorData.error || "Translation not found");
      }

      return await translationRes.json();
    },
    enabled: !!id,
    refetchInterval: (query) => {
      // Poll every 3 seconds if processing, otherwise don't poll
      return query.state.data?.processing ? 3000 : false;
    },
    refetchIntervalInBackground: false,
    retry: false,
  });

  const translation = data?.translation;
  const processing = data?.processing;

  const getTranslatedText = () => {
    if (!translation) return "";

    const languageKey = `text${
      userLanguage.charAt(0).toUpperCase() + userLanguage.slice(1)
    }` as keyof Translation;
    return (translation[languageKey] as string) || translation.textEnglish;
  };

  if (loading) {
    return (
      <div className="fullTranslationOverview">
        <div className="loading-container">
          <h2 className="loading-title">Loading...</h2>
        </div>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="fullTranslationOverview">
        <div className="loading-container">
          <h2 className="loading-title">Loading...</h2>
          <p className="loading-description">
            Your document is being translated.
          </p>
          <p className="loading-subtitle">
            Feel free to navigate away - translation will continue in the
            background and flashcards/quizzes will be generated automatically.
          </p>
          <div className="spinner" />
          <div className="button-group">
            <button onClick={() => navigate("/documents")}>
              ← Back to Documents
            </button>
            <button onClick={() => navigate("/learning/custom")}>
              Go to Learning Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error || !translation) {
    return (
      <div className="fullTranslationOverview">
        <div className="error-container">
          <h2 className="error-title">Error</h2>
          <p className="error-message">
            {error instanceof Error ? error.message : "Translation not found."}
          </p>
          <div className="error-buttons">
            <button onClick={() => navigate("/documents")}>
              ← Back to Documents
            </button>
            <button onClick={() => window.location.reload()}>
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  const languageNames: Record<string, string> = {
    english: "English",
    french: "French",
    chinese: "Chinese",
    spanish: "Spanish",
    tagalog: "Tagalog",
    punjabi: "Punjabi",
    korean: "Korean",
  };

  return (
    <div className="fullTranslationOverview">
      {/* Mobile Header */}
      <div className="full-translation-header">
        <button 
          className="back-button"
          onClick={() => navigate(`/study/${id}`)}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        <h1 className="page-title">
          {translation.document.filename}
        </h1>
        <button className="menu-button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1"/>
            <circle cx="19" cy="12" r="1"/>
            <circle cx="5" cy="12" r="1"/>
          </svg>
        </button>
      </div>

      {/* Document Navigation */}
      <div className="document-nav-container">
        <DocumentNav defaultTab="document" documentId={id} />
      </div>

      {/* Main Content */}
      <div className="content-container">
        <div className="translation-content">
          <div className="content-text">
            {getTranslatedText()}
          </div>
        </div>
      </div>
    </div>
  );
}
