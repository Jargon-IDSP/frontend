import type { Question, CustomQuestion } from '../../types/learning';
import type { QuestionCardProps } from '../../types/questionCard';
import '../../styles/components/_questionCard.scss';

export default function QuestionCard({ question, index, type = 'existing' }: QuestionCardProps) {
  const isExisting = type === 'existing' && 'difficulty' in question;

  const getPromptText = () => {
    if (type === 'existing') {
      return (question as Question).prompt;
    } else {
      const customQ = question as CustomQuestion;
      return customQ.promptEnglish || '';
    }
  };

  const getCorrectAnswer = () => {
    if (type === 'existing') {
      return (question as Question).correctAnswer;
    } else {
      const customQ = question as CustomQuestion;
      if (!customQ.correctAnswer) return null;
      return {
        term: customQ.correctAnswer.termEnglish || '',
        definition: customQ.correctAnswer.definitionEnglish || ''
      };
    }
  };

  const getDifficultyClass = (difficulty: number) => {
    if (difficulty >= 3) return 'question-card__badge--difficulty-high';
    if (difficulty >= 2) return 'question-card__badge--difficulty-medium';
    return 'question-card__badge--difficulty-low';
  };

  const promptText = getPromptText();
  const correctAnswer = getCorrectAnswer();

  return (
    <div className="question-card">
      <div className="question-card__header">
        <strong className="question-card__title">Question {index}</strong>
        {isExisting && (
          <div className="question-card__meta">
            <span className={`question-card__badge ${getDifficultyClass(question.difficulty)}`}>
              Difficulty: {question.difficulty}/5
            </span>
            <span className="question-card__badge question-card__badge--points">
              {question.points} pts
            </span>
          </div>
        )}
      </div>

      <div className="question-card__prompt-section">
        <strong className="question-card__prompt-label">Prompt:</strong>
        <p className="question-card__prompt-text">{promptText}</p>
      </div>

      {correctAnswer && (
        <div className="question-card__answer-section">
          <strong className="question-card__answer-label">✓ Correct Answer:</strong>
          <div className="question-card__answer-item">
            <strong>Term:</strong> {correctAnswer.term}
          </div>
          <div className="question-card__answer-item">
            <strong>Definition:</strong> {correctAnswer.definition}
          </div>
        </div>
      )}

      {isExisting && question.tags && question.tags.length > 0 && (
        <div className="question-card__tags">
          <div className="question-card__tags-container">
            {question.tags.map((tag: string, i: number) => (
              <span key={i} className="question-card__tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {type === 'custom' && 'createdAt' in question && (
        <div className="question-card__created-date">
          Created: {new Date(question.createdAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}