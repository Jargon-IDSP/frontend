import type { Question, CustomQuestion } from '../../types/learning';

interface QuestionCardProps {
  question: Question | CustomQuestion;
  index: number;
  type?: 'existing' | 'custom';
}

export default function QuestionCard({ question, index, type = 'existing' }: QuestionCardProps) {
  const isExisting = type === 'existing' && 'difficulty' in question;
  
  // Helper to get prompt text
  const getPromptText = () => {
    if (type === 'existing') {
      return (question as Question).prompt;
    } else {
      const customQ = question as CustomQuestion;
      return customQ.promptEnglish || '';
    }
  };

  // Helper to get correct answer
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

  const promptText = getPromptText();
  const correctAnswer = getCorrectAnswer();

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
        alignItems: 'center',
        borderBottom: '2px solid #f0f0f0',
        paddingBottom: '0.5rem'
      }}>
        <strong style={{ fontSize: '1.1rem' }}>Question {index}</strong>
        {isExisting && (
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
            <span style={{ 
              padding: '0.25rem 0.75rem',
              backgroundColor: question.difficulty >= 3 ? '#fee' : question.difficulty >= 2 ? '#fef3c7' : '#d1fae5',
              color: question.difficulty >= 3 ? '#991b1b' : question.difficulty >= 2 ? '#92400e' : '#065f46',
              borderRadius: '12px',
              fontWeight: '500'
            }}>
              Difficulty: {question.difficulty}/5
            </span>
            <span style={{ 
              padding: '0.25rem 0.75rem',
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              borderRadius: '12px',
              fontWeight: '500'
            }}>
              {question.points} pts
            </span>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <strong style={{ display: 'block', marginBottom: '0.5rem', color: '#374151' }}>
          Prompt:
        </strong>
        <p style={{ 
          margin: 0, 
          fontSize: '1.05rem',
          lineHeight: '1.6',
          color: '#1f2937'
        }}>
          {promptText}
        </p>
      </div>

      {correctAnswer && (
        <div style={{ 
          backgroundColor: '#f0fdf4',
          padding: '1rem',
          borderRadius: '6px',
          border: '1px solid #86efac'
        }}>
          <strong style={{ 
            display: 'block', 
            marginBottom: '0.5rem',
            color: '#166534'
          }}>
            ✓ Correct Answer:
          </strong>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Term:</strong> {correctAnswer.term}
          </div>
          <div>
            <strong>Definition:</strong> {correctAnswer.definition}
          </div>
        </div>
      )}

      {isExisting && question.tags && question.tags.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {question.tags.map((tag: string, i: number) => (
              <span
                key={i}
                style={{
                  padding: '0.25rem 0.75rem',
                  backgroundColor: '#f3f4f6',
                  color: '#4b5563',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {type === 'custom' && 'createdAt' in question && (
        <div style={{ 
          marginTop: '1rem',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          Created: {new Date(question.createdAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}