import { useNavigate } from 'react-router-dom';
import type { Quiz, CustomQuiz } from '../../types/learning';

interface QuizCardProps {
  quiz: Quiz | CustomQuiz;
  index: number;
  type?: 'existing' | 'custom';
}

export default function QuizCard({ quiz, index, type = 'existing' }: QuizCardProps) {
  const navigate = useNavigate();
  
  // Check if this is a CustomQuiz (template) or Quiz (completed attempt)
  const isCustomQuiz = !('score' in quiz);
  const isCompleted = !isCustomQuiz && quiz.completed;
  const questionCount = quiz.questions?.length || 0;
  const maxScore = questionCount * 5; 
  const scoreValue = !isCustomQuiz && 'score' in quiz ? (quiz.score || 0) : 0;
  const scorePercentage = maxScore > 0 ? (scoreValue / maxScore) * 100 : 0;

  const handleStartQuiz = () => {
    if (type === 'custom') {
      // Pass the actual quiz ID to take the quiz
      navigate(`/learning/custom/quiz/take?quizId=${quiz.id}`);
    } else if ('level' in quiz) {
      navigate(`/learning/existing/levels/${quiz.level.id}/quiz/take`);
    }
  };

  return (
    <div
      style={{
        border: '1px solid #ddd',
        padding: '1.5rem',
        marginBottom: '1rem',
        borderRadius: '8px',
        backgroundColor: '#fff',
      }}
    >
      <div style={{ 
        marginBottom: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '2px solid #f0f0f0',
        paddingBottom: '0.75rem'
      }}>
        <div>
          <strong style={{ fontSize: '1.2rem', display: 'block', marginBottom: '0.25rem' }}>
            Quiz {index}
          </strong>
          {type === 'existing' && 'level' in quiz && (
            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
              Level: {quiz.level.name}
            </span>
          )}
          {type === 'custom' && 'document' in quiz && quiz.document && (
            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
              Document: {quiz.document.filename}
            </span>
          )}
        </div>

        <span style={{
          padding: '0.5rem 1rem',
          backgroundColor: isCustomQuiz ? '#e0e7ff' : (isCompleted ? '#d1fae5' : '#fef3c7'),
          color: isCustomQuiz ? '#3730a3' : (isCompleted ? '#065f46' : '#92400e'),
          borderRadius: '12px',
          fontWeight: '600',
          fontSize: '0.875rem'
        }}>
          {isCustomQuiz ? 'Not Started' : (isCompleted ? '✓ Completed' : 'In Progress')}
        </span>
      </div>

      {/* Show Start Quiz button for unstarted quizzes */}
      {isCustomQuiz && (
        <button
          onClick={handleStartQuiz}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '1rem'
          }}
        >
          Start Quiz ({questionCount} questions)
        </button>
      )}

      {/* Show score for completed quizzes */}
      {!isCustomQuiz && (
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{ 
            backgroundColor: '#f9fafb',
            padding: '1rem',
            borderRadius: '6px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
              Score
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
              {scoreValue}
            </div>
            {maxScore > 0 && (
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                out of {maxScore} ({Math.round(scorePercentage)}%)
              </div>
            )}
          </div>

          <div style={{ 
            backgroundColor: '#f9fafb',
            padding: '1rem',
            borderRadius: '6px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
              Questions
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
              {questionCount}
            </div>
          </div>

          <div style={{ 
            backgroundColor: '#f9fafb',
            padding: '1rem',
            borderRadius: '6px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
              {isCompleted ? 'Completed' : 'Started'}
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>
              {new Date('createdAt' in quiz ? quiz.createdAt : Date.now()).toLocaleDateString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
              {new Date('createdAt' in quiz ? quiz.createdAt : Date.now()).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}

      {!isCustomQuiz && isCompleted && maxScore > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ 
            width: '100%',
            height: '8px',
            backgroundColor: '#e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${scorePercentage}%`,
              height: '100%',
              backgroundColor: scorePercentage >= 80 ? '#10b981' : scorePercentage >= 60 ? '#f59e0b' : '#ef4444',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      {questionCount > 0 && (
        <div style={{ 
          marginTop: '1rem',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          This quiz contains {questionCount} question{questionCount !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}