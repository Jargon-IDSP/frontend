import { useNavigate } from 'react-router-dom';
import type { QuizCardProps } from '../../types/quizCard';
import '../../styles/components/_quizCard.scss';

export default function QuizCard({ quiz, index, type = 'existing', hasAttempts = false, category }: QuizCardProps) {
  const navigate = useNavigate();

  const isUserQuizAttempt = 'customQuizId' in quiz;
  const isCustomQuiz = !('score' in quiz) && !isUserQuizAttempt;
  const isExistingQuiz = 'score' in quiz && 'levelId' in quiz;

  const isCompleted = isUserQuizAttempt ? quiz.completed : (isExistingQuiz && quiz.completed);

  let questionCount = 0;
  let scoreValue = 0;
  let maxScore = 0;

  if (isUserQuizAttempt) {
    questionCount = quiz.totalQuestions;
    scoreValue = quiz.pointsEarned;
    maxScore = quiz.maxPossiblePoints;
  } else if (isCustomQuiz) {
    questionCount = (quiz as any)._count?.questions || quiz.questions?.length || 0;
    maxScore = questionCount * 5;
  } else if (isExistingQuiz) {
    questionCount = (quiz as any)._count?.questions || quiz.questions?.length || 0;
    maxScore = questionCount * 5;
    scoreValue = quiz.score || 0;
  }

  const scorePercentage = maxScore > 0 ? (scoreValue / maxScore) * 100 : 0;

  const getProgressClass = () => {
    if (scorePercentage >= 80) return 'quiz-card__progress-fill--high';
    if (scorePercentage >= 60) return 'quiz-card__progress-fill--medium';
    return 'quiz-card__progress-fill--low';
  };

  const getStatusBadgeClass = () => {
    if (isCustomQuiz) return 'quiz-card__status-badge--not-started';
    if (isCompleted) return 'quiz-card__status-badge--completed';
    return 'quiz-card__status-badge--in-progress';
  };

  const handleStartQuiz = () => {
    if (isUserQuizAttempt) {
      if (category) {
        navigate(`/learning/custom/categories/${category}/quiz/take?quizId=${quiz.customQuizId}`);
      } else {
        navigate(`/learning/custom/quiz/take?quizId=${quiz.customQuizId}`);
      }
    } else if (type === 'custom' && isCustomQuiz) {
      if (category) {
        navigate(`/learning/custom/categories/${category}/quiz/take?quizId=${quiz.id}`);
      } else {
        navigate(`/learning/custom/quiz/take?quizId=${quiz.id}`);
      }
    } else if (isExistingQuiz && 'level' in quiz) {
      navigate(`/learning/existing/levels/${quiz.level.id}/quiz/take`);
    }
  };

  if (isCustomQuiz && hasAttempts) {
    return (
      <button onClick={handleStartQuiz} className="quiz-card-compact">
        New Attempt ({questionCount} questions)
      </button>
    );
  }

  return (
    <div className="quiz-card">
      <div className="quiz-card__header">
        <div>
          <strong className="quiz-card__title">
            {isUserQuizAttempt ? `Attempt ${index}` : `Quiz ${index}`}
          </strong>
          {type === 'existing' && isExistingQuiz && 'level' in quiz && (
            <span className="quiz-card__subtitle">
              Level: {quiz.level.name}
            </span>
          )}
          {type === 'custom' && isCustomQuiz && 'document' in quiz && quiz.document && (
            <span className="quiz-card__subtitle">
              Document: {quiz.document.filename}
            </span>
          )}
          {isUserQuizAttempt && quiz.customQuiz && (
            <span className="quiz-card__subtitle">
              Quiz: {quiz.customQuiz.name}
            </span>
          )}
        </div>

        {(!isCustomQuiz || !hasAttempts) && (
          <span className={`quiz-card__status-badge ${getStatusBadgeClass()}`}>
            {isCustomQuiz ? 'Not Started' : (isCompleted ? '✓ Completed' : 'In Progress')}
          </span>
        )}
      </div>

      {isCustomQuiz && (
        <button onClick={handleStartQuiz} className="quiz-card__button">
          {hasAttempts ? 'New Attempt' : 'Start Quiz'} ({questionCount} questions)
        </button>
      )}

      {!isCustomQuiz && (
        <div className="quiz-card__stats-grid">
          <div className="quiz-card__stat">
            <div className="quiz-card__stat-label">Score</div>
            <div className="quiz-card__stat-value">{scoreValue}</div>
            {maxScore > 0 && (
              <div className="quiz-card__stat-subtext">
                out of {maxScore} ({Math.round(scorePercentage)}%)
              </div>
            )}
          </div>

          <div className="quiz-card__stat">
            <div className="quiz-card__stat-label">Questions</div>
            <div className="quiz-card__stat-value">{questionCount}</div>
          </div>

          <div className="quiz-card__stat">
            <div className="quiz-card__stat-label">
              {isCompleted ? 'Completed' : 'Started'}
            </div>
            <div className="quiz-card__stat-date">
              {new Date('createdAt' in quiz ? quiz.createdAt : Date.now()).toLocaleDateString()}
            </div>
            <div className="quiz-card__stat-time">
              {new Date('createdAt' in quiz ? quiz.createdAt : Date.now()).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {!isCustomQuiz && isCompleted && maxScore > 0 && (
        <div className="quiz-card__progress">
          <div className="quiz-card__progress-bar">
            <div
              className={`quiz-card__progress-fill ${getProgressClass()}`}
              style={{ width: `${scorePercentage}%` }}
            />
          </div>
        </div>
      )}

      {questionCount > 0 && (
        <div className="quiz-card__question-count">
          This quiz contains {questionCount} question{questionCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}