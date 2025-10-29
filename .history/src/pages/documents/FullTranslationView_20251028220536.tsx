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

  // This section for styling
  return (
    <div className="fullTranslationOverview">
      <DocumentNav defaultTab="document" />
      <div>
        <div>
          <button onClick={() => navigate(`/study/${id}`)}>
            ← Back to Study Materials
          </button>
          <button onClick={() => navigate("/learning/custom")}>
            Study All Custom Content
          </button>
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
          {translation.document.filename}
        </h1>
        <p style={{ color: "#6b7280" }}>
          Uploaded on{" "}
          {new Date(translation.document.createdAt).toLocaleDateString()}
        </p>

        <div style={{ marginTop: "1rem" }}>
          <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
            Study from this document:
          </h3>
        </div>
      </div>

      <div
        style={{
          border: "2px solid #e5e7eb",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1rem",
            backgroundColor: "#f9fafb",
            borderBottom: "2px solid #e5e7eb",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
            {languageNames[userLanguage] || "English"} Translation
          </h2>
        </div>

        <div
          style={{
            padding: "1.5rem",
            backgroundColor: "white",
          }}
        >
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              margin: 0,
              fontFamily: "inherit",
              lineHeight: "1.6",
              fontSize: "1rem",
            }}
          >
            {getTranslatedText()}
          </pre>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
