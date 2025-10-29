import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useUserPreferences } from '../../hooks/useUserPreferences';

export default function QuizSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { levelId, quizNumber } = useParams<{ 
    levelId?: string;
    quizNumber?: string;
  }>();
  
  const { language, industryId } = useUserPreferences();
  
  const type = location.pathname.includes('/existing/') ? 'existing' : 'custom';

const handleStartQuiz = () => {
  const params = new URLSearchParams();
  params.set('quiz', quizNumber || '1');
  params.set('language', language); 
  if (industryId) {
    params.set('industry_id', industryId.toString());
  }

  if (type === 'existing' && levelId) {
    navigate(`/learning/existing/levels/${levelId}/quiz/take?${params}`);
  } else {
    navigate(`/learning/custom/quiz/take?${params}`);
  }
};

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
        ← Back
      </button>

      <h1>Start a Quiz</h1>
      
      <div style={{
        backgroundColor: '#f9fafb',
        padding: '2rem',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        marginTop: '2rem',
      }}>
        <h2 style={{ marginTop: 0 }}>Quiz #{quizNumber || '1'}</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          {type === 'existing' 
            ? 'Test your knowledge with Red Seal practice questions.'
            : 'Test your knowledge with custom questions from your documents.'}
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
        
          {type === 'existing' && levelId && (
            <p style={{ margin: '0.5rem 0', color: '#666' }}>
              <strong>Level:</strong> {levelId}
            </p>
          )}
          {industryId && (
            <p style={{ margin: '0.5rem 0', color: '#666' }}>
              <strong>Industry ID:</strong> {industryId}
            </p>
          )}
        </div>

        <button
          onClick={handleStartQuiz}
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Start Quiz →
        </button>
      </div>
    </div>
  );
}