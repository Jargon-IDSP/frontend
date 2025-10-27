import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import { useCategoryQuestions } from "../../hooks/useCategoryQuestions";
import { useCompleteQuiz } from "../../hooks/useCompleteQuiz";
import QuizComponent from "../../components/learning/QuizComponent";

export default function TakeCategoryQuiz() {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  const [searchParams] = useSearchParams();
  const { language } = useUserPreferences();

  const quizNumber = parseInt(searchParams.get("quiz") || "1");
  const quizId = searchParams.get("quizId");

  // Fetch category questions
  const {
    data: questions = [],
    isLoading: loading,
    error: queryError,
  } = useCategoryQuestions(category, "english");

  // Complete quiz mutation
  const completeQuizMutation = useCompleteQuiz();

  const handleQuizComplete = async (score: number, totalQuestions: number) => {
    if (!category) return;

    completeQuizMutation.mutate({
      type: "custom",
      score,
      totalQuestions,
      category,
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
        <button
          onClick={() => navigate(`/learning/custom/categories/${category}`)}
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
      onBack={() => navigate(`/learning/custom/categories/${category}`)}
      preferredLanguage={language}
    />
  );
}
