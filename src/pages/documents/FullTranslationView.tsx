import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDocumentTranslation } from "../../hooks/useDocumentTranslation";
import { useTranslatedText } from "../../hooks/useTranslatedText";
import { useDocumentProcessingStatus } from "../../hooks/useDocumentProcessingStatus";
import DocumentNav from "../../components/DocumentNav";
import goBackIcon from "../../assets/icons/goBackIcon.svg";
import DocOptionsDrawer from "../drawers/DocOptionsDrawer";

export default function FullTranslationView() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOptions = () => {
    setIsDrawerOpen(true);
  };

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useDocumentTranslation(id);
  const { data: statusData } = useDocumentProcessingStatus({
    documentId: id || null,
  });
  const translatedText = useTranslatedText(data?.translation);

  const translation = data?.translation;
  const processing = data?.processing;

  const hasFlashcards = statusData?.status?.hasFlashcards || false;
  const hasQuiz = statusData?.status?.hasQuiz || false;
  const hasQuickTranslation = statusData?.status?.quickTranslation || false;
  const hasQuickFlashcards =
    hasQuickTranslation && (statusData?.status?.flashcardCount || 0) > 0;
  const hasQuickQuestions =
    hasQuickTranslation && (statusData?.status?.questionCount || 0) > 0;

  if (isLoading) {
    return (
      <div className="fullTranslationOverview">
        <div className="loading-container">
          <h2 className="loading-title">Loading...</h2>
        </div>
      </div>
    );
  }

  if (processing && !translation) {
    return (
      <div className="fullTranslationOverview">
        <div className="loading-container">
          <h2 className="loading-title">Processing Document...</h2>
          <p className="loading-description">
            Your document is being processed.
          </p>
          <p className="loading-subtitle">
            Feel free to navigate away - processing will continue in the
            background.
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
            <button onClick={() => navigate(-1)}>
              <img src={goBackIcon} alt="Back Button" />
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
    const canNavigate =
      (hasFlashcards && hasQuiz) || (hasQuickFlashcards && hasQuickQuestions);
    if (canNavigate) {
      navigate(`/learning/documents/${id}/study`);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const documentTitle =
    translation?.document?.filename || "Document Translation";

  const isProcessingComplete = hasFlashcards && hasQuiz;
  const canStudy =
    isProcessingComplete || (hasQuickFlashcards && hasQuickQuestions);

  return (
    <>
      <DocOptionsDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />

      <div className="fullTranslationOverview">
        <div className="container demo">
          <DocumentNav
            activeTab="document"
            title={documentTitle}
            onLessonClick={canStudy ? handleLessonClick : undefined}
            onBackClick={handleBackClick}
            onSubtitleClick={handleOptions}
          />

          <div className="content-container">
            <div className="translation-content">
              <div className="content-text">{translatedText}</div>
            </div>

            {!isProcessingComplete && (
              <div className="processing-notice">
                {!canStudy && <div className="spinner" />}
                {canStudy ? (
                  <>
                    <p>
                      Lessons are ready! Click the Lesson tab to start studying.
                    </p>
                    <p className="processing-subtitle">
                      Full multilingual support is being finalized in the
                      background.
                    </p>
                  </>
                ) : (
                  <>
                    <p>Generating flashcards and quiz questions...</p>
                    <p className="processing-subtitle">
                      The lesson tab will be available once processing is
                      complete.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
