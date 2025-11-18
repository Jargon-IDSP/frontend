import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDocumentJobStatus } from "../../hooks/useDocumentJobStatus";
import { useNotificationContext } from "../../contexts/NotificationContext";
import type { ProcessingDocumentCardProps } from "@/types/components";
import hat from "../../assets/uploadAnimation/accessories/hat.svg";
import vest from "../../assets/uploadAnimation/accessories/vest.svg";
import drill from "../../assets/uploadAnimation/accessories/drill.svg";
import rockyHat from "../../assets/uploadAnimation/rocky/rockyHat.svg";
import rockyHatVest from "../../assets/uploadAnimation/rocky/rockyHatVest.svg";
import rockyFullGear from "../../assets/uploadAnimation/rocky/rockyFull.svg";

export function ProcessingDocumentCard({
  filename,
  status,
  documentId,
}: ProcessingDocumentCardProps) {
  const navigate = useNavigate();
  const [currentItem, setCurrentItem] = useState(0);
  const [showCostumed, setShowCostumed] = useState(false);

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

  const { data: jobStatus } = useDocumentJobStatus({
    documentId: documentId || null,
    pollingInterval: 1000,
  });

  const canStudy =
    status.quickTranslation &&
    (status.flashcardCount > 0 || status.questionCount > 0);

  const isFullyComplete =
    status.hasTranslation && status.hasFlashcards && status.hasQuiz;

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

  const getStepState = (stepName: string) => {
    switch (stepName) {
      case "Translation":
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
      progress: jobStatus?.ocr?.progress,
    },
    {
      name: "Flashcards",
      complete:
        status.hasFlashcards ||
        (status.quickTranslation && status.flashcardCount > 0),
      state: getStepState("Flashcards"),
      progress: jobStatus?.flashcards?.progress,
    },
    {
      name: "Questions",
      complete:
        status.hasQuiz || (status.quickTranslation && status.questionCount > 0),
      state: getStepState("Questions"),
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

  const workSequence = [
    { message: "Let me grab my hardhat!", item: <img src={hat} alt="Hardhat" /> },
    { message: "Time for the high-vis vest!", item: <img src={vest} alt="High-vis vest" /> },
    { message: "Now, where's that drill?", item: <img src={drill} alt="Drill" /> },
  ];

  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    const schedulePickups = () => {
      timeouts.push(setTimeout(() => setCurrentItem(1), 2900));
      timeouts.push(setTimeout(() => setCurrentItem(2), 6100));
      timeouts.push(setTimeout(() => setCurrentItem(3), 9300));
      timeouts.push(setTimeout(() => setCurrentItem(4), 12500));
      timeouts.push(setTimeout(() => {
        setCurrentItem(0);
        schedulePickups();
      }, 16000));
    };

    schedulePickups();

    return () => timeouts.forEach(timeout => clearTimeout(timeout));
  }, []);

  const getRockyImage = () => {
    switch (currentItem) {
      case 0:
        return "/rockyYellow.svg";
      case 1:
        return rockyHat;
      case 2:
        return rockyHatVest;
      case 3:
      case 4:
        return rockyFullGear;
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

      <div className="rocky-animation">
        <div className="rocky-animation__scene">
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

          <div className={`rocky-animation__rocky ${showCostumed ? 'rocky-animation__rocky--costumed' : ''}`}>
            <img src={getRockyImage()} alt="Rocky" />
          </div>

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
