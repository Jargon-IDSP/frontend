import type { Quiz, CustomQuiz } from '../../types/learning';

interface QuizCardProps {
  quiz: Quiz | CustomQuiz;
  index: number;
  type?: 'existing' | 'custom';
}

export default function QuizCard({ quiz, index, type = 'existing' }: QuizCardProps) {
  const isCompleted = quiz.completed;
  const questionCount = quiz.questions?.length || 0;
  const maxScore = questionCount * 5; 
  const scorePercentage = maxScore > 0 ? (quiz.score / maxScore) * 100 : 0;

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
          backgroundColor: isCompleted ? '#d1fae5' : '#fef3c7',
          color: isCompleted ? '#065f46' : '#92400e',
          borderRadius: '12px',
          fontWeight: '600',
          fontSize: '0.875rem'
        }}>
          {isCompleted ? '✓ Completed' : 'In Progress'}
        </span>
      </div>

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
            {quiz.score}
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
            {new Date(isCompleted && quiz.completedAt ? quiz.completedAt : quiz.createdAt).toLocaleDateString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
            {new Date(isCompleted && quiz.completedAt ? quiz.completedAt : quiz.createdAt).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {isCompleted && maxScore > 0 && (
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
        <details style={{ marginTop: '1rem' }}>
          <summary style={{ 
            cursor: 'pointer',
            color: '#3b82f6',
            fontWeight: '500',
            fontSize: '0.9rem'
          }}>
            View Questions ({questionCount})
          </summary>
          <div style={{ 
            marginTop: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            {quiz.questions.slice(0, 5).map((q, i) => (
              <div 
                key={q.id}
                style={{ 
                  padding: '0.5rem',
                  marginBottom: '0.5rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '4px',
                  fontSize: '0.875rem'
                }}
              >
                <strong>Q{i + 1}:</strong> {q.correctAnswer?.term || 'Question ' + (i + 1)}
              </div>
            ))}
            {questionCount > 5 && (
              <div style={{ 
                fontSize: '0.875rem',
                color: '#6b7280',
                fontStyle: 'italic',
                marginTop: '0.5rem'
              }}>
                ... and {questionCount - 5} more questions
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  );
}