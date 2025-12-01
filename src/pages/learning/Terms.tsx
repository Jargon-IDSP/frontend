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
import LoadingBar from "../../components/LoadingBar";
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

  let type: "existing" | "custom" = "custom";
  let endpoint = "";

  if (location.pathname.includes("/existing/")) {
    type = "existing";
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

  let finishHref = "/learning/custom/quizzes";
  if (location.pathname.includes("/existing/")) {
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
      <LoadingBar
        isLoading={showLoading}
        hasData={!!data}
        hasError={!!error}
        text="Loading terms"
      />

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
          <div className="flashcard-header-container">
            <button onClick={() => navigate(-1)} className="flashcard-back-button">
              <img src={goBackIcon} alt="Go Back" />
            </button>
            <div className="flashcard-progress-wrapper">
              <div className="flashcards-carousel-progress">
                <div
                  className="flashcards-carousel-progress-bar"
                  style={{ width: `${((currentTermIndex + 1) / count) * 100}%` }}
                />
              </div>
            </div>
          </div>
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