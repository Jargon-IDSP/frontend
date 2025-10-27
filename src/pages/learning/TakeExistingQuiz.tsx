import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import { useExistingQuiz } from "../../hooks/useExistingQuiz";
import { useCompleteExistingQuiz } from "../../hooks/useCompleteExistingQuiz";
import QuizComponent from "../../components/learning/QuizComponent";

export default function TakeExistingQuiz() {
  const navigate = useNavigate();
  const { levelId } = useParams<{ levelId: string }>();
  const [searchParams] = useSearchParams();
  const { language, industryId } = useUserPreferences();

  const quizNumber = parseInt(searchParams.get("quiz") || "1");
  const queryIndustryId =
    searchParams.get("industry_id") || industryId?.toString();

  // Fetch quiz questions
  const {
    data: questions = [],
    isLoading: loading,
    error: queryError,
  } = useExistingQuiz(levelId, quizNumber, queryIndustryId, "english");

  // Complete quiz mutation
  const completeQuizMutation = useCompleteExistingQuiz();

  const handleQuizComplete = async (score: number, totalQuestions: number) => {
    if (!levelId) return;

    completeQuizMutation.mutate({
      type: "existing",
      score,
      totalQuestions,
      levelId,
      quizId: `quiz-${levelId}-${Date.now()}`,
    });
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
        <button
          onClick={() => navigate("/learning/existing/levels")}
          style={{ marginBottom: "1rem" }}
        >
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
      onBack={() => navigate("/learning/existing/levels")}
      preferredLanguage={language}
    />
  );
}
