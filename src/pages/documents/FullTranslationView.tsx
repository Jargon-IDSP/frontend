import { useParams, useNavigate } from "react-router-dom";
import { useDocumentTranslation } from "../../hooks/useDocumentTranslation";
import { useTranslatedText } from "../../hooks/useTranslatedText";
import DocumentNav from "../../components/DocumentNav";


export default function FullTranslationView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useDocumentTranslation(id);
  const translatedText = useTranslatedText(data?.translation);

  const translation = data?.translation;
  const processing = data?.processing;

  if (isLoading) {
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

  const handleLessonClick = () => {
    navigate(`/learning/documents/${id}/quizzes`);
  };

  const handleBackClick = () => {
    navigate('/documents');
  };

  return (
        <div className="fullTranslationOverview">
        <div className="container demo">
        <DocumentNav 
          activeTab="document"
          title="Level 2 Acronyms"
          onLessonClick={handleLessonClick}
          onBackClick={handleBackClick}
        />

      <div className="content-container">
        <div className="translation-content">
          <div className="content-text">{translatedText}</div>
        </div>
      </div>
    </div>
    </div>
  );
}
