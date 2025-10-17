import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useLearning } from '../../hooks/useLearning';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import QuizCard from '../../components/learning/QuizCard'; 
import type { Quiz, CustomQuiz } from '../../types/learning';

export default function Quizzes() { 
  const navigate = useNavigate();
  const { type, levelId, documentId } = useParams<{ 
    type?: 'existing' | 'custom'; 
    levelId?: string;
    documentId?: string;
  }>();
  const [searchParams] = useSearchParams();
  
  const { language, industryId, loading: preferencesLoading } = useUserPreferences();
  
  const queryLanguage = searchParams.get('language') || language;
  const queryIndustryId = searchParams.get('industry_id') || industryId?.toString();

  let endpoint = '';
  if (documentId) {
    endpoint = `documents/${documentId}/quizzes`;  
  } else if (levelId && type === 'existing') {
    endpoint = `levels/${levelId}/quizzes`;  
  } else {
    endpoint = 'quizzes';  
  }

const { data, error } = useLearning<Quiz[] | CustomQuiz[]>({  
  type: type || 'custom',
  endpoint,
  params: { 
    language: queryLanguage,
    ...(queryIndustryId && { industry_id: queryIndustryId })
  },
  enabled: !preferencesLoading
});

const quizzes: (Quiz | CustomQuiz)[] = data?.data || []; 
const count = data?.count || 0;
const isEmpty = quizzes.length === 0;

  const showLoading = !data && !error;

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
        ← Back
      </button>

      <h1>{type === 'existing' ? 'Red Seal' : 'Custom'} Quiz History</h1>
      
      {error && (
        <div style={{ 
          backgroundColor: '#fee', 
          padding: '1rem', 
          borderRadius: '6px',
          border: '1px solid #fcc',
          marginTop: '1rem'
        }}>
          <strong>Error loading quizzes</strong>
          <p style={{ margin: '0.5rem 0 0 0' }}>{error}</p>
        </div>
      )}

      {showLoading && (
        <div style={{ 
          padding: '3rem 2rem', 
          textAlign: 'center',
          color: '#666'
        }}>
          <p style={{ margin: 0, fontSize: '1rem' }}>Loading quizzes...</p>
        </div>
      )}

      {!error && data && (
        <>
          <p style={{ color: '#666', marginBottom: '0.5rem' }}>
            Language: <strong style={{ textTransform: 'capitalize' }}>{queryLanguage}</strong>
          </p>

          {count > 0 && (
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              Total: {count} quizzes
            </p>
          )}

          {isEmpty ? (
            <div style={{ 
              backgroundColor: '#f0f0f0', 
              padding: '2rem', 
              borderRadius: '6px',
              marginTop: '2rem',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, fontSize: '1.1rem', color: '#666' }}>
                {type === 'custom' 
                  ? 'No quizzes taken yet. Take a quiz to see your history here.'
                  : 'No quizzes found for this level.'}
              </p>
            </div>
          ) : (
            <div style={{ marginTop: '2rem' }}>
              {quizzes.map((quiz, index) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  index={index + 1}
                  type={type}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}