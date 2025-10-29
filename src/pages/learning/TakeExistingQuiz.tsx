import { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import { useExistingQuiz } from "../../hooks/useExistingQuiz";
import { useCompleteExistingQuiz } from "../../hooks/useCompleteExistingQuiz";
import QuizComponent from "../../components/learning/QuizComponent";
import QuizCompletion from "../../components/learning/QuizCompletion";

export default function TakeExistingQuiz() {
  const navigate = useNavigate();
  const { levelId } = useParams<{ levelId: string }>();
  const [searchParams] = useSearchParams();
  const { language, industryId } = useUserPreferences();

  const quizNumber = parseInt(searchParams.get("quiz") || "1");
  const queryIndustryId =
    searchParams.get("industry_id") || industryId?.toString();

  const [quizCompleted, setQuizCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const {
    data: questions = [],
    isLoading: loading,
    error: queryError,
  } = useExistingQuiz(levelId, quizNumber, queryIndustryId, "english");

  const completeQuizMutation = useCompleteExistingQuiz();

  const handleQuizComplete = async (score: number, total: number) => {
    if (!levelId) return;

    setFinalScore(score);
    setTotalQuestions(total);
    setQuizCompleted(true);

    completeQuizMutation.mutate({
      type: "existing",
      score,
      totalQuestions: total,
      levelId,
      quizId: `quiz-${levelId}-${Date.now()}`,
    });
  };

  const handleRetry = () => {
    setQuizCompleted(false);
    setFinalScore(0);
    setTotalQuestions(0);
  };

  const handleBackToQuizzes = () => {
    navigate("/learning/existing/levels");
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

  if (quizCompleted) {
    return (
      <QuizCompletion
        score={finalScore}
        totalQuestions={totalQuestions}
        onRetry={handleRetry}
        onBack={handleBackToQuizzes}
      />
    );
  }

  return (
    <QuizComponent
      questions={questions}
      quizNumber={quizNumber}
      onComplete={handleQuizComplete}
      onBack={handleBackToQuizzes}
      preferredLanguage={language}
    />
  );
}