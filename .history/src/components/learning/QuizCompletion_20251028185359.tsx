/*interface QuizCompletionProps {
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
*/

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

    const getPerformanceClass = () => {
        if (percentage >= 80) return "excellent";
        if (percentage >= 60) return "good";
        return "needs-improvement";
    };

    const getEmoji = () => {
        if (percentage >= 80) return "🌟";
        if (percentage >= 60) return "👍";
        return "📚";
    };

    return (
        <div className='quiz-completion'>
            <h1 className='quiz-completion__title'>
                Awesome! You completed your 🎉
            </h1>

            <div className='quiz-completion__card'>
                <div className='quiz-completion__emoji'>{getEmoji()}</div>

                <h2 className='quiz-completion__score'>
                    Your Score: {score} / {totalQuestions}
                </h2>

                <p
                    className={`quiz-completion__percentage ${getPerformanceClass()}`}>
                    {percentage}%
                </p>

                <div className='quiz-completion__progress-bar'>
                    <div
                        className={`quiz-completion__progress-bar-fill ${getPerformanceClass()}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>

            <div className='quiz-completion__actions'>
                <button
                    onClick={onRetry}
                    className='quiz-completion__button quiz-completion__button--primary'>
                    Try Again
                </button>
                <button
                    onClick={onBack}
                    className='quiz-completion__button quiz-completion__button--secondary'>
                    Back to Quizzes
                </button>
            </div>
        </div>
    );
}
