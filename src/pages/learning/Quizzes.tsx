import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useLearning } from '../../hooks/useLearning';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import QuizCard from '../../components/learning/QuizCard';
import EmptyState from '../../components/learning/EmptyState';
import type { Quiz, CustomQuiz } from '../../types/learning';

export default function Quizzes() { 
  const navigate = useNavigate();
  const location = window.location;
  const { type, levelId, documentId, category } = useParams<{ 
    type?: 'existing' | 'custom'; 
    levelId?: string;
    documentId?: string;
    category?: string;
  }>();
  const [searchParams] = useSearchParams();
  
  const { language, industryId, loading: preferencesLoading } = useUserPreferences();
  
  const queryLanguage = searchParams.get('language') || language;
  const queryIndustryId = searchParams.get('industry_id') || industryId?.toString();

  // Determine the actual type based on URL path
  const actualType = location.pathname.includes('/existing/') ? 'existing' : 'custom';

  let endpoint = '';
  if (documentId) {
    endpoint = `documents/${documentId}/quizzes`;  
  } else if (category) {
    endpoint = `category/${category}/quizzes`;
  } else if (levelId && actualType === 'existing') {
    endpoint = `levels/${levelId}/quizzes`;  
  } else {
    endpoint = 'quizzes';  
  }

const { data, error } = useLearning<Quiz[] | CustomQuiz[]>({  
  type: actualType,
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

  const handleBack = () => {
    if (documentId) {
      navigate(`/documents/${documentId}/study`);
    } else if (category) {
      navigate(`/learning/custom/category/${category}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={handleBack} style={{ marginBottom: '1rem' }}>
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
            type === 'custom' ? (
              <EmptyState type="quizzes" />
            ) : (
              <div>
                <p>No quizzes found for this level.</p>
              </div>
            )
          ) : (
            <div style={{ marginTop: '2rem' }}>
              {quizzes.map((quiz, index) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  index={index + 1}
                  type={actualType}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}