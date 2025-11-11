// components/quiz/ExistingQuizContainer.tsx
import { useExistingQuiz } from "../../../hooks/useExistingQuiz";
import { useCompleteExistingQuiz } from "../../../hooks/useCompleteExistingQuiz";
import { QuizLoader } from "./QuizLoader";
import QuizComponent from "../../../components/learning/QuizComponent";

interface ExistingQuizContainerProps {
  levelId?: string;
  quizNumber: number;
  industryId?: string;
  language: string;
  onBack: () => void;
}

export function ExistingQuizContainer({
  levelId,
  quizNumber,
  industryId,
  language,
  onBack,
}: ExistingQuizContainerProps) {
  const {
    data: questions = [],
    isLoading,
    error,
  } = useExistingQuiz(levelId, quizNumber, industryId, language);

  const completeQuizMutation = useCompleteExistingQuiz();

  const handleQuizComplete = async (score: number, totalQuestions: number) => {
    if (!levelId) return;

    completeQuizMutation.mutate({
      type: "existing",
      score,
      totalQuestions,
      levelId,
      quizId: `quiz-${levelId}-${Date.now()}`,
      quizNumber: quizNumber ? parseInt(String(quizNumber)) : undefined,
      industryId: industryId ? parseInt(industryId) : undefined,
    });
  };

  return (
    <div className="container">
      <QuizLoader isLoading={isLoading} error={error} onBack={onBack}>
        <QuizComponent
          questions={questions}
          quizNumber={quizNumber}
          onComplete={handleQuizComplete}
          onBack={onBack}
          preferredLanguage={language}
        />
      </QuizLoader>
    </div>
  );
}