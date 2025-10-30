import { useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import { useCustomQuiz } from "../../hooks/useCustomQuiz";
import { useExistingQuiz } from "../../hooks/useExistingQuiz";
import { useCategoryQuestions } from "../../hooks/useCategoryQuestions";
import { useCompleteQuizAttempt } from "../../hooks/useCompleteQuizAttempt";
import { useCompleteExistingQuiz } from "../../hooks/useCompleteExistingQuiz";
import { useCompleteQuiz } from "../../hooks/useCompleteQuiz";
import QuizComponent from "../../components/learning/QuizComponent";

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
  const { levelId, category } = useParams<{ levelId?: string; category?: string }>();
  const [searchParams] = useSearchParams();
  const { language, industryId } = useUserPreferences();

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

  // Fetch questions based on type
  const customQuiz = useCustomQuiz(quizId, quizNumber, quizType === 'custom');
  const existingQuiz = useExistingQuiz(
    levelId,
    quizNumber,
    queryIndustryId,
    language,
    quizType === 'existing'
  );
  const categoryQuiz = useCategoryQuestions(category, language, quizType === 'category');

  // Select the appropriate query result
  const activeQuery = quizType === 'custom'
    ? customQuiz
    : quizType === 'existing'
    ? existingQuiz
    : categoryQuiz;

  const { data: questions = [], isLoading: loading, error: queryError } = activeQuery;

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
    if (quizType === 'existing') {
      navigate("/learning/existing/levels");
    } else if (quizType === 'category' && category) {
      navigate(`/learning/custom/categories/${category}`);
    } else {
      navigate(-1);
    }
  };

  const error = queryError ? (queryError as Error).message : null;

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Loading quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <QuizComponent
      questions={questions}
      quizNumber={quizNumber}
      onComplete={handleQuizComplete}
      onBack={handleBack}
      preferredLanguage={language}
    />
  );
}
