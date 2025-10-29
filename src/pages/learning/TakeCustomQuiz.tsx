import { useSearchParams, useNavigate } from "react-router-dom";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import { useCustomQuiz } from "../../hooks/useCustomQuiz";
import { useCompleteQuizAttempt } from "../../hooks/useCompleteQuizAttempt";
import QuizComponent from "../../components/learning/QuizComponent";

export default function TakeCustomQuiz() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useUserPreferences();

  const quizId = searchParams.get("quizId");
  const quizNumber = parseInt(searchParams.get("quiz") || "1");

  console.log("TakeCustomQuiz rendered", { quizId, quizNumber });

  // Fetch quiz questions
  const {
    data: questions = [],
    isLoading: loading,
    error: queryError,
  } = useCustomQuiz(quizId, quizNumber);

  // Complete quiz mutation
  const completeQuizMutation = useCompleteQuizAttempt();

  const handleQuizComplete = async (score: number, totalQuestions: number) => {
    completeQuizMutation.mutate({
      type: "custom",
      score,
      totalQuestions,
      ...(quizId && { quizId }),
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
        <button onClick={() => navigate(-1)} style={{ marginBottom: "1rem" }}>
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
      onBack={() => navigate(-1)}
      preferredLanguage={language}
    />
  );
}
