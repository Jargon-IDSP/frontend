import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDocumentsByCategory } from "../../hooks/useDocumentsByCategory";
import { useDocumentProcessingStatus } from "../../hooks/useDocumentProcessingStatus";
import { useDocumentJobStatus } from "../../hooks/useDocumentJobStatus";
import { useQueryClient } from "@tanstack/react-query";
import { useNotificationContext } from "../../contexts/NotificationContext";
import LoadingBar from "../../components/LoadingBar";
import goBackIcon from "../../assets/icons/goBackIcon.svg";
import hat from "../../assets/uploadAnimation/accessories/hat.svg";
import vest from "../../assets/uploadAnimation/accessories/vest.svg";
import drill from "../../assets/uploadAnimation/accessories/drill.svg";
import rockyHat from "../../assets/uploadAnimation/rocky/rockyHat.svg";
import rockyHatVest from "../../assets/uploadAnimation/rocky/rockyHatVest.svg";
import rockyFullGear from "../../assets/uploadAnimation/rocky/rockyFull.svg";


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
  const [currentItem, setCurrentItem] = useState(0);
  const [showCostumed, setShowCostumed] = useState(false);

  // Delay the costumed class to sync with bounce animation (happens at bottom of bounce)
  useEffect(() => {
    if (currentItem > 0) {
      const timeout = setTimeout(() => setShowCostumed(true), 100);
      return () => clearTimeout(timeout);
    } else {
      setShowCostumed(false);
    }
  }, [currentItem]);
  const [hasShownSneakPeekToast, setHasShownSneakPeekToast] = useState(false);
  const { showToast } = useNotificationContext();

  // Fetch job status for detailed progress
  const { data: jobStatus } = useDocumentJobStatus({
    documentId: documentId || null,
    pollingInterval: 1000,
  });

  // If quick translation is available, user can start studying immediately
  const canStudy =
    status.quickTranslation &&
    (status.flashcardCount > 0 || status.questionCount > 0);

  // Check if document is fully complete
  const isFullyComplete =
    status.hasTranslation && status.hasFlashcards && status.hasQuiz;

  // Show sneak peek toast when ready
  useEffect(() => {
    if (canStudy && !hasShownSneakPeekToast && documentId) {
      showToast({
        id: `sneak-peek-${documentId}-${Date.now()}`,
        type: "SUCCESS",
        title: "Sneak Peek Ready!",
        message: "Your document is still saving to your profile, but we've generated a sneak peek that you can practice now! Click to start studying.",
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: "",
        actionUrl: `/learning/documents/${documentId}/study`,
      });
      setHasShownSneakPeekToast(true);
    }
  }, [canStudy, hasShownSneakPeekToast, showToast, documentId]);

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
    { message: "Let me grab my hardhat!", item: <img src={hat} alt="Hardhat" /> },
    { message: "Time for the high-vis vest!", item: <img src={vest} alt="High-vis vest" /> },
    { message: "Now, where's that drill?", item: <img src={drill} alt="Drill" /> },
  ];

  // Items get picked up progressively and reset when Rocky completes his walk
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    const schedulePickups = () => {
      // First pickup (hardhat) at 2.9s
      timeouts.push(setTimeout(() => setCurrentItem(1), 2900));
      // Second pickup (vest) at 6.1s (2.9s + 3.2s)
      timeouts.push(setTimeout(() => setCurrentItem(2), 6100));
      // Third pickup (drill) at 9.3s (2.9s + 3.2s + 3.2s)
      timeouts.push(setTimeout(() => setCurrentItem(3), 9300));
      // State 4 at 12.5s (2.9s + 3.2s + 3.2s + 3.2s)
      timeouts.push(setTimeout(() => setCurrentItem(4), 12500));
      // Reset at 16s to match Rocky's walk cycle
      timeouts.push(setTimeout(() => {
        setCurrentItem(0);
        schedulePickups();
      }, 16000));
    };

    schedulePickups();

    return () => timeouts.forEach(timeout => clearTimeout(timeout));
  }, []);

  // Determine which Rocky image to show based on items picked up
  const getRockyImage = () => {
    switch (currentItem) {
      case 0:
        return "/rockyYellow.svg"; // Default happy Rocky
      case 1:
        return rockyHat; // Picked up hat
      case 2:
        return rockyHatVest; // Picked up hat and vest
      case 3:
      case 4:
        return rockyFullGear; // Picked up all items (states 3 & 4: walking off screen)
      default:
        return "/rockyYellow.svg";
    }
  };

  return (
    <div
      className={`processing-card ${
        canStudy || isFullyComplete ? "processing-card--clickable processing-card--ready" : ""
      }`}
      onClick={() => {
        if ((canStudy || isFullyComplete) && documentId) {
          navigate(`/learning/documents/${documentId}/study`);
        }
      }}
      style={{ cursor: canStudy || isFullyComplete ? "pointer" : "default" }}
    >
      <div className="processing-card__header">
        <h3>{filename}</h3>
        {(canStudy || isFullyComplete) && (
          <span className="processing-card__badge processing-card__badge--ready">
            {isFullyComplete ? "READY TO STUDY" : "SNEAK PEEK READY"}
          </span>
        )}
        </div>

      {/* Rocky Animation Section */}
      <div className="rocky-animation">
        <div className="rocky-animation__scene">
          {/* Speech Bubble - only show while collecting items */}
          {currentItem < 3 && (
            <div className="rocky-animation__speech-bubble">
              <svg
                className="rocky-animation__bubble-svg"
                viewBox="0 0 180 110"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 5 Q5 5 5 15 L5 70 Q5 80 15 80 L75 80 L90 100 L105 80 L165 80 Q175 80 175 70 L175 15 Q175 5 165 5 Z"
                  fill="white"
                  stroke="#0828C0"
                  strokeWidth="2"
                />
              </svg>
              <span className="rocky-animation__message">
                {workSequence[currentItem].message}
              </span>
            </div>
          )}

          {/* Rocky Walking */}
          <div className={`rocky-animation__rocky ${showCostumed ? 'rocky-animation__rocky--costumed' : ''}`}>
            <img src={getRockyImage()} alt="Rocky" />
          </div>

          {/* Work Items */}
          <div className="rocky-animation__items">
            <div
              className={`rocky-animation__item rocky-animation__item--hat ${
                currentItem > 0 ? "picked-up" : ""
              }`}
            >
              <img src={hat} alt="Hardhat" />
            </div>
            <div
              className={`rocky-animation__item ${
                currentItem > 1 ? "picked-up" : ""
              }`}
            >
              <img src={vest} alt="High-vis vest" />
            </div>
            <div
              className={`rocky-animation__item ${
                currentItem > 2 ? "picked-up" : ""
              }`}
            >
              <img src={drill} alt="Drill" />
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
  const initialStatusData = location.state?.initialStatusData;

  const { data: statusData } = useDocumentProcessingStatus({
    documentId: justUploaded ? justUploadedDocId : null,
    pollingInterval: 1000,
  });

  // Use initial status data from navigation if available, otherwise use hook data
  const displayStatusData = statusData || initialStatusData;

  // When coming from upload, wait for status data before showing content
  const isWaitingForStatusData = justUploaded && !displayStatusData;

  useEffect(() => {
    if (statusData?.status.status === "completed" && justUploadedDocId) {
      // Invalidate queries to refetch the document list
      refetch();
      queryClient.invalidateQueries({
        queryKey: ["documents", "by-category", category],
      });

      // Automatically redirect to the study page when fully saved
      setTimeout(() => {
        navigate(`/learning/documents/${justUploadedDocId}/study`);
      }, 1000);
    }
  }, [statusData?.status.status, refetch, queryClient, category, justUploadedDocId, navigate]);

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

      {/* Show loading bar while waiting for status data after upload */}
      {isWaitingForStatusData && (
        <LoadingBar isLoading={true} text="Loading document status" />
      )}

      {/* Show processing card once status data is available */}
      {justUploaded && displayStatusData && (
        <ProcessingDocumentCard
          filename={displayStatusData.document.filename}
          status={displayStatusData.status}
          documentId={displayStatusData.document.id}
        />
      )}

      {/* Only show document list after status data is loaded (if coming from upload) */}
      {!isWaitingForStatusData && (
        <>
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
                  displayStatusData?.status.status === "processing"
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
        </>
      )}
    </div>
  );
}
