import { useState, useEffect } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useLearning } from "../../hooks/useLearning";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import FlashcardsCarousel from "../../components/learning/FlashcardsCarousel";
import EmptyState from "../../components/learning/EmptyState";
import type { Term } from "../../types/learning";
import goBackIcon from "../../assets/icons/goBackIcon.svg";

export default function Terms() {
  const navigate = useNavigate();
  const location = useLocation();
  const { levelId, documentId, category, sessionNumber } = useParams<{
    levelId?: string;
    documentId?: string;
    category?: string;
    sessionNumber?: string;
  }>();
  const [searchParams] = useSearchParams();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentTermIndex, setCurrentTermIndex] = useState(0);

  const {
    language,
    industryId,
    loading: preferencesLoading,
  } = useUserPreferences();

  const queryLanguage = searchParams.get("language") || language;
  const queryIndustryId =
    searchParams.get("industry_id") || industryId?.toString();
  const showAll = searchParams.get("all") === "true";

  // Determine type and endpoint
  let type: "existing" | "custom" = "custom";
  let endpoint = "";

  if (location.pathname.includes("/existing/")) {
    type = "existing";
    // If showAll flag is set, use industry-only endpoint (same as terminology page)
    if (showAll && queryIndustryId) {
      endpoint = `levels/${levelId}/industry/${queryIndustryId}/terms`;
    } else {
      endpoint = `levels/${levelId}/terms`;
    }
  } else if (location.pathname.includes("/learning/documents/")) {
    type = "custom";
    endpoint = `documents/${documentId}/terms`;
  } else if (category) {
    type = "custom";
    endpoint = `categories/${category}/terms`;
  } else {
    type = "custom";
    endpoint = "terms";
  }

  const { data, error } = useLearning<Term[]>({
    type,
    endpoint,
    params: {
      language: queryLanguage,
      // Only pass industry_id as param when NOT using showAll (industry-only endpoint already has it in path)
      ...(queryIndustryId &&
        type === "existing" && !showAll && { industry_id: queryIndustryId }),
      ...(sessionNumber && { limit: "10", session: sessionNumber }),
    },
    enabled: !preferencesLoading,
  });

  const terms = data?.data || [];
  const count = data?.count || 0;
  const isEmpty = terms.length === 0;
  const showLoading = !data && !error;

  // Build dynamic finish URL based on current context
  let finishHref = "/learning/custom/quizzes";
  if (location.pathname.includes("/existing/")) {
    // Check if this is the new Red Seal flashcards route
    if (location.pathname.includes("/flashcards/")) {
      finishHref = `/learning/existing/levels`;
    } else if (levelId) {
      finishHref = `/learning/existing/levels/${levelId}/quizzes`;
    }
  } else if (location.pathname.includes("/learning/documents/")) {
    if (documentId) finishHref = `/learning/documents/${documentId}/study`;
  } else if (category) {
    finishHref = `/learning/custom/categories/${category}/quizzes`;
  }

  // Simulate progress while loading
  useEffect(() => {
    if (showLoading) {
      setLoadingProgress(0);
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) return prev; // Stop at 90% until data arrives
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(interval);
    } else if (data) {
      setLoadingProgress(100);
    }
  }, [showLoading, data]);

  // Reset to first term when terms change
  useEffect(() => {
    setCurrentTermIndex(0);
  }, [terms.length]);

  const handleNext = () => {
    if (currentTermIndex < terms.length - 1) {
      setCurrentTermIndex(currentTermIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentTermIndex > 0) {
      setCurrentTermIndex(currentTermIndex - 1);
    }
  };

  return (
    <div className="terms-page">
      <div className="terms-page-header">
        <button onClick={() => navigate(-1)}>
          <img src={goBackIcon} alt="Go Back" />
          </button>
      </div>

      {/* Progress Bar */}
      {showLoading && (
        <div className="terms-page-progress">
          <div className="terms-page-progress-bar-container">
            <div
              className="terms-page-progress-bar-fill"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <div className="terms-page-progress-text">
            Loading terms... {loadingProgress}%
          </div>
        </div>
      )}

      {error && (
        <div className="terms-page-error">
          <strong>Error loading terms</strong>
          <p>{error}</p>
        </div>
      )}

      {!error && data && (
        <>
          {isEmpty ? (
            type !== "existing" ? (
              <EmptyState type="terms" />
            ) : (
              <div className="terms-page-empty">
                <p>No terms found for this level.</p>
              </div>
            )
          ) : (
            <div className="terms-page-content">
              <FlashcardsCarousel
                terms={terms}
                currentIndex={currentTermIndex}
                onNext={handleNext}
                onPrevious={handlePrevious}
                language={queryLanguage}
                type={type === "existing" ? "existing" : "custom"}
                totalCount={count}
                finishHref={finishHref}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}