import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import { useCustomQuiz } from "../../hooks/useCustomQuiz";
import { useExistingQuiz } from "../../hooks/useExistingQuiz";
import { useCategoryQuestions } from "../../hooks/useCategoryQuestions";
import { useCompleteQuizAttempt } from "../../hooks/useCompleteQuizAttempt";
import { useCompleteExistingQuiz } from "../../hooks/useCompleteExistingQuiz";
import { useCompleteQuiz } from "../../hooks/useCompleteQuiz";
import QuizComponent from "../../components/learning/QuizComponent";
import LoadingBar from "../../components/LoadingBar";

type QuizType = 'custom' | 'existing' | 'category';

/**
 * UnifiedQuizTaker - Intelligent quiz component that handles all quiz types
 *
 * Automatically detects quiz type based on route and fetches appropriate data:
 * - Custom: /learning/custom/quiz/take?quizId=xxx
 * - Existing: /learning/existing/levels/:levelId/quiz/take
 * - Category: /learning/custom/categories/:category/quiz/take
 *
 * Consolidates TakeCustomQuiz, TakeExistingQuiz, and TakeCategoryQuiz into one component
 */
export default function UnifiedQuizTaker() {
  const navigate = useNavigate();
  const location = useLocation();
  const { levelId, category, sessionNumber } = useParams<{ levelId?: string; category?: string; sessionNumber?: string }>();
  const [searchParams] = useSearchParams();
  const { language: userLanguage, industryId } = useUserPreferences();

  // Determine quiz type from route
  const quizType: QuizType = levelId
    ? 'existing'
    : category
    ? 'category'
    : 'custom';

  // Extract common params
  const quizNumber = parseInt(searchParams.get("quiz") || "1");
  const quizId = searchParams.get("quizId");
  const queryIndustryId = searchParams.get("industry_id") || industryId?.toString();

  // Always fetch questions with english as default, backend should return all translations in prompts object
  const language = "english";

  // For translate button: use user preferences to determine target language
  const displayLanguage = userLanguage || "english";

  // Fetch questions based on type
  const customQuiz = useCustomQuiz(quizId, quizNumber, quizType === 'custom');
  const existingQuiz = useExistingQuiz(
    levelId,
    quizNumber,
    queryIndustryId,
    language
  );
  const categoryQuiz = useCategoryQuestions(category, language);

  // Select the appropriate query result based on quiz type
  // Only use data from the active query to prevent unnecessary fetches
  const activeQuery = quizType === 'custom'
    ? customQuiz
    : quizType === 'existing'
    ? existingQuiz
    : categoryQuiz;

  const { data: questions = [], isLoading: loading, error: queryError } = activeQuery;

  // Check if the query should be enabled based on required parameters
  const isEnabled = quizType === 'custom'
    ? !!quizId
    : quizType === 'existing'
    ? !!levelId
    : !!category;

  // Show loading if query is not enabled yet
  if (!isEnabled && !loading) {
    return (
      <div className="quiz-page-wrapper">
        <div className="container">
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <p>Invalid quiz parameters...</p>
          </div>
        </div>
      </div>
    );
  }

  // Completion mutations based on type
  const completeCustom = useCompleteQuizAttempt();
  const completeExisting = useCompleteExistingQuiz();
  const completeCategory = useCompleteQuiz();

  // Handle quiz completion
  const handleQuizComplete = async (score: number, totalQuestions: number) => {
    if (quizType === 'custom') {
      completeCustom.mutate({
        type: "custom",
        score,
        totalQuestions,
        ...(quizId && { quizId }),
      });
    } else if (quizType === 'existing' && levelId) {
      completeExisting.mutate({
        type: "existing",
        score,
        totalQuestions,
        levelId,
        industryId: queryIndustryId ? parseInt(queryIndustryId) : undefined,
        quizNumber,
        quizId: `quiz-${levelId}-${Date.now()}`,
      });
    } else if (quizType === 'category' && category) {
      completeCategory.mutate({
        type: "custom",
        score,
        totalQuestions,
        category,
        ...(quizId && { quizId }),
      });
    }
  };

  // Determine back navigation based on type
  const handleBack = () => {
    // Check if this is a Red Seal quiz with sessionNumber
    if (quizType === 'existing' && location.pathname.includes('/quiz/') && sessionNumber) {
      navigate('/learning/existing/levels');
    } else {
      navigate(-1);
    }
  };

  const error = queryError ? (queryError as Error).message : null;

  if (loading) {
    return (
      <div className="quiz-page-wrapper">
        <div className="container">
          <LoadingBar isLoading={true} text="Loading quiz" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="quiz-page-wrapper">
        <div className="container">
          <div style={{ padding: "2rem" }}>
            <button onClick={handleBack} style={{ marginBottom: "1rem" }}>
              ← Back
            </button>
            <div
              style={{
                backgroundColor: "#fee",
                padding: "1rem",
                borderRadius: "6px",
              }}
            >
              <strong>Error:</strong> {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QuizComponent
      questions={questions}
      quizNumber={quizNumber}
      onComplete={handleQuizComplete}
      onBack={handleBack}
      preferredLanguage={displayLanguage}
      quizType={quizType}
    />
  );
}
