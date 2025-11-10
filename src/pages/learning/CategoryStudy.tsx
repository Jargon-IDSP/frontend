import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDocumentsByCategory } from "../../hooks/useDocumentsByCategory";
import { useDocumentProcessingStatus } from "../../hooks/useDocumentProcessingStatus";
import { useDocumentJobStatus } from "../../hooks/useDocumentJobStatus";
import { useQueryClient } from "@tanstack/react-query";
import goBackIcon from "../../assets/icons/goBackIcon.svg";

const categoryNames: Record<string, string> = {
  safety: "Safety",
  technical: "Technical",
  training: "Training",
  workplace: "Workplace",
  professional: "Professional",
  general: "General",
};

interface ProcessingDocumentCardProps {
  filename: string;
  status: {
    hasTranslation: boolean;
    hasFlashcards: boolean;
    hasQuiz: boolean;
    flashcardCount: number;
    questionCount: number;
    quickTranslation?: boolean;
  };
  documentId?: string;
}

function ProcessingDocumentCard({
  filename,
  status,
  documentId,
}: ProcessingDocumentCardProps) {
  const navigate = useNavigate();
  const [currentMessage, setCurrentMessage] = useState(0);
  const [currentItem, setCurrentItem] = useState(0);

  // Fetch job status for detailed progress
  const { data: jobStatus } = useDocumentJobStatus({
    documentId: documentId || null,
    pollingInterval: 1000,
  });

  // If quick translation is available, user can start studying immediately
  const canStudy =
    status.quickTranslation &&
    (status.flashcardCount > 0 || status.questionCount > 0);

  // Enhanced steps with job progress (OCR + Translation run together, not shown separately)
  const getStepState = (stepName: string) => {
    switch (stepName) {
      case "Translation":
        // Translation runs in OCR worker, use OCR job state if available
        return jobStatus?.ocr?.state;
      case "Flashcards":
      case "Questions":
        return jobStatus?.flashcards?.state;
      default:
        return undefined;
    }
  };

  const steps = [
    {
      name: "Translation",
      complete: status.hasTranslation || status.quickTranslation,
      state: getStepState("Translation"),
      // Use real OCR job progress if available, otherwise undefined (will show as "in progress" without %)
      progress: jobStatus?.ocr?.progress,
    },
    {
      name: "Flashcards",
      complete:
        status.hasFlashcards ||
        (status.quickTranslation && status.flashcardCount > 0),
      state: getStepState("Flashcards"),
      // Use real flashcard job progress
      progress: jobStatus?.flashcards?.progress,
    },
    {
      name: "Questions",
      complete:
        status.hasQuiz || (status.quickTranslation && status.questionCount > 0),
      state: getStepState("Questions"),
      // Questions are generated with flashcards, so use same progress
      progress: jobStatus?.flashcards?.progress,
    },
    {
      name: "Saving to Profile",
      complete: status.hasTranslation && status.hasFlashcards && status.hasQuiz,
      state: undefined,
      progress: undefined,
    },
  ];

  const activeStepIndex = steps.findIndex((step) => !step.complete);

  // Rocky's messages and items based on processing stage
  const workSequence = [
    { message: "Let me grab my hardhat!", item: "🪖" },
    { message: "Time for the high-vis vest!", item: "🦺" },
    { message: "Now, where's that hammer?", item: "🔨" },
    { message: "All geared up and ready!", item: "✓" },
  ];

  // Cycle through messages every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % workSequence.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Items get picked up progressively and reset when Rocky completes his walk
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentItem((prev) => {
        const next = prev + 1;
        // After picking up all 3 items (at 3), reset to 0 after one more cycle
        // This gives Rocky time to walk off screen before items respawn
        if (prev === 3) {
          return 0; // Reset items
        }
        return next;
      });
    }, 4000); // Pick up items every 4 seconds (4s * 4 = 16s = full walk cycle)
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`processing-card ${
        canStudy ? "processing-card--clickable" : ""
      }`}
      onClick={() => {
        if (canStudy && documentId) {
          navigate(`/learning/documents/${documentId}/study`);
        }
      }}
      style={{ cursor: canStudy ? "pointer" : "default" }}
    >
      <h3 className="processing-card__header">
        {filename}
        <span
          className={`processing-card__badge ${
            canStudy ? "processing-card__badge--ready" : ""
          }`}
        >
          {canStudy ? "SNEAK PEEK READY" : "PROCESSING"}
        </span>
      </h3>

      {/* Rocky Animation Section */}
      <div className="rocky-animation">
        <div className="rocky-animation__scene">
          {/* Speech Bubble */}
          <div className="rocky-animation__speech-bubble">
            <svg
              className="rocky-animation__bubble-svg"
              viewBox="0 0 194 131"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20.9384 4.79796L13.5453 66.0892L20.9384 113.717L0.31543 130.504L32.2227 124.648L66.4646 130.504H177.362L193.315 87.9511L169.969 19.6328L92.1461 0.503662L20.9384 4.79796Z"
                fill="white"
                stroke="#0828C0"
              />
            </svg>
            <span className="rocky-animation__message">
              {workSequence[currentMessage].message}
            </span>
          </div>

          {/* Rocky Walking */}
          <div className="rocky-animation__rocky">
            <img src="/rockyYellow.svg" alt="Rocky" />
          </div>

          {/* Work Items */}
          <div className="rocky-animation__items">
            <div
              className={`rocky-animation__item ${
                currentItem > 0 ? "picked-up" : ""
              }`}
            >
              🪖
            </div>
            <div
              className={`rocky-animation__item ${
                currentItem > 1 ? "picked-up" : ""
              }`}
            >
              🦺
            </div>
            <div
              className={`rocky-animation__item ${
                currentItem > 2 ? "picked-up" : ""
              }`}
            >
              🔨
            </div>
          </div>
        </div>
      </div>

      <div className="processing-card__steps">
        {steps.map((step, index) => {
          const isActive = index === activeStepIndex && !step.complete;
          const isFailed = step.state === "failed";
          const indicatorClass = step.complete
            ? "processing-card__step-indicator--complete"
            : isFailed
            ? "processing-card__step-indicator--failed"
            : isActive
            ? "processing-card__step-indicator--active"
            : "processing-card__step-indicator--pending";

          const labelClass = step.complete
            ? "processing-card__step-label--complete"
            : isFailed
            ? "processing-card__step-label--failed"
            : isActive
            ? "processing-card__step-label--active"
            : "processing-card__step-label--pending";

          return (
            <div key={step.name} className="processing-card__step">
              <div
                className={`processing-card__step-indicator ${indicatorClass}`}
              >
                {step.complete ? "✓" : isFailed ? "✗" : isActive ? "..." : ""}
              </div>
              <span className={`processing-card__step-label ${labelClass}`}>
                {step.name}
                {isActive && (
                  <span className="processing-card__progress-text">
                    (
                    {step.state === "active" &&
                    step.progress !== undefined &&
                    step.progress > 0
                      ? `${step.progress}%`
                      : "in progress"}
                    )
                  </span>
                )}
                {isFailed && (
                  <span className="processing-card__progress-text">
                    (failed - retrying...)
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CategoryStudy() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { category } = useParams<{ category: string }>();

  const categoryName = category
    ? categoryNames[category.toLowerCase()] || category
    : "Category";

  const {
    data: documents = [],
    isLoading,
    refetch,
  } = useDocumentsByCategory(category || "general");

  const justUploadedDocId = location.state?.documentId;
  const justUploaded = location.state?.justUploaded;

  const { data: statusData } = useDocumentProcessingStatus({
    documentId: justUploaded ? justUploadedDocId : null,
    pollingInterval: 1000,
  });

  useEffect(() => {
    if (statusData?.status.status === "completed") {
      // Invalidate queries to refetch the document list
      refetch();
      queryClient.invalidateQueries({
        queryKey: ["documents", "by-category", category],
      });

      // Clear the upload state
      window.history.replaceState({}, document.title);
    }
  }, [statusData?.status.status, refetch, queryClient, category]);

  return (
    <div className="category-study">
      <div className="category-study__header">
        <img
          src={goBackIcon}
          alt="Go back"
          className="category-study__back-icon"
          onClick={() => navigate(-1)}
        />
        <h1 className="category-study__header-title">
          {categoryName} Category
        </h1>
      </div>

      {justUploaded &&
        statusData &&
        statusData.status.status === "processing" && (
          <ProcessingDocumentCard
            filename={statusData.document.filename}
            status={statusData.status}
            documentId={statusData.document.id}
          />
        )}

      {isLoading ? (
        <div className="category-study__loading">Loading documents...</div>
      ) : documents.length === 0 && !justUploaded ? (
        <div className="category-study__empty-state">
          <p>No documents in the {categoryName} category yet.</p>
          <p className="category-study__empty-state-description">
            Upload and process documents to see them here!
          </p>
        </div>
      ) : (
        <div className="category-study__documents-list">
          {documents.map((doc) => {
            // Hide the just-uploaded document while it's being processed
            if (
              justUploaded &&
              doc.id === justUploadedDocId &&
              statusData?.status.status === "processing"
            ) {
              return null;
            }

            const isProcessing =
              !doc.ocrProcessed ||
              doc.flashcardCount === 0 ||
              doc.questionCount === 0;

            return (
              <div
                key={doc.id}
                onClick={() => {
                  if (!isProcessing) {
                    navigate(`/learning/documents/${doc.id}/study`);
                  }
                }}
                className={`document-card ${
                  isProcessing ? "document-card--processing" : ""
                }`}
              >
                <div className="document-card__content">
                  <div className="document-card__details">
                    <h3 className="document-card__title">{doc.filename}</h3>
                    {isProcessing ? (
                      <p className="document-card__status document-card__status--processing">
                        Processing document...
                      </p>
                    ) : (
                      <p className="document-card__status document-card__status--ready">
                        {doc.flashcardCount} flashcards • {doc.questionCount}{" "}
                        questions
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
