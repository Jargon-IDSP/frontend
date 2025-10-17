import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useLearning } from '../../hooks/useLearning';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import QuestionCard from '../../components/learning/QuestionCard';
import type { Question, CustomQuestion } from '../../types/learning';

export default function Questions() {
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
    endpoint = `documents/${documentId}/questions`;
  } else if (levelId && type === 'existing') {
    endpoint = `levels/${levelId}/questions`;
  } else {
    endpoint = 'questions'; 
  }

  const { data, error } = useLearning<Question[] | CustomQuestion[]>({
    type: type || 'custom',
    endpoint,
    params: { 
      language: queryLanguage,
      ...(queryIndustryId && { industry_id: queryIndustryId })
    },
    enabled: !preferencesLoading
  });

  const questions = data?.data || [];
  const count = data?.count || 0;
  const isEmpty = questions.length === 0;

  const showLoading = !data && !error;

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
        ← Back
      </button>

      <h1>{type === 'existing' ? 'Red Seal' : 'Custom'} Questions</h1>
      
      {error && (
        <div style={{ 
          backgroundColor: '#fee', 
          padding: '1rem', 
          borderRadius: '6px',
          border: '1px solid #fcc',
          marginTop: '1rem'
        }}>
          <strong>Error loading questions</strong>
          <p style={{ margin: '0.5rem 0 0 0' }}>{error}</p>
        </div>
      )}

      {showLoading && (
        <div style={{ 
          padding: '3rem 2rem', 
          textAlign: 'center',
          color: '#666'
        }}>
          <p style={{ margin: 0, fontSize: '1rem' }}>Loading questions...</p>
        </div>
      )}

      {!error && data && (
        <>
          <p style={{ color: '#666', marginBottom: '0.5rem' }}>
            Language: <strong style={{ textTransform: 'capitalize' }}>{queryLanguage}</strong>
          </p>

          {count > 0 && (
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              Total: {count} questions
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
                  ? 'No custom questions found. Create questions from your documents.'
                  : 'No questions found for this level.'}
              </p>
            </div>
          ) : (
            <div style={{ marginTop: '2rem' }}>
              {questions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
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