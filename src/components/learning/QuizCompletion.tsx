interface QuizCompletionProps {
  score: number;
  totalQuestions: number;
  onRetry: () => void;
  onBack: () => void;
}

export default function QuizCompletion({
  score,
  totalQuestions,
  onRetry,
  onBack,
}: QuizCompletionProps) {
  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <div>
      <h1>Quiz Complete!</h1>
      <div>
        <h2>Your Score: {score} / {totalQuestions}</h2>
        <p>{percentage}%</p>
      </div>

      <div>
        <button onClick={onRetry}>Try Again</button>
        <button onClick={onBack}>Back to Quizzes</button>
      </div>
    </div>
  );
}
