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

export default function UnifiedQuizTaker() {
  const navigate = useNavigate();
  const location = useLocation();
  const { levelId, category, sessionNumber } = useParams<{ levelId?: string; category?: string; sessionNumber?: string }>();
  const [searchParams] = useSearchParams();
  const { language: userLanguage, industryId } = useUserPreferences();

  const quizType: QuizType = levelId
    ? 'existing'
    : category
    ? 'category'
    : 'custom';

  const quizNumber = parseInt(searchParams.get("quiz") || "1");
  const quizId = searchParams.get("quizId");
  const queryIndustryId = searchParams.get("industry_id") || industryId?.toString();

  const language = "english";

  const displayLanguage = userLanguage || "english";

  const customQuiz = useCustomQuiz(quizId, quizNumber, quizType === 'custom');
  const existingQuiz = useExistingQuiz(
    levelId,
    quizNumber,
    queryIndustryId,
    language
  );
  const categoryQuiz = useCategoryQuestions(category, language);


  const activeQuery = quizType === 'custom'
    ? customQuiz
    : quizType === 'existing'
    ? existingQuiz
    : categoryQuiz;

  const { data: questions = [], isLoading: loading, error: queryError } = activeQuery;

  const isEnabled = quizType === 'custom'
    ? !!quizId
    : quizType === 'existing'
    ? !!levelId
    : !!category;

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

  const completeCustom = useCompleteQuizAttempt();
  const completeExisting = useCompleteExistingQuiz();
  const completeCategory = useCompleteQuiz();

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

  const handleBack = () => {
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
    <div className="container">
      <div className="quiz-page-wrapper">
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
