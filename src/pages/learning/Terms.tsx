import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useLearning } from '../../hooks/useLearning';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import TermCard from '../../components/learning/TermCard';
import EmptyState from '../../components/learning/EmptyState';
import type { Term } from '../../types/learning';

export default function Terms() {
  const navigate = useNavigate();
  const location = useLocation();
  const { levelId, documentId, category } = useParams<{ 
    levelId?: string;
    documentId?: string;
    category?: string;
  }>();
  const [searchParams] = useSearchParams();
  
  const type = location.pathname.includes('/custom') ? 'custom' : 'existing';
  
  const { language, industryId, loading: preferencesLoading } = useUserPreferences();
  
  const queryLanguage = searchParams.get('language') || language;
  const queryIndustryId = searchParams.get('industry_id') || industryId?.toString();

  let endpoint = '';
  if (documentId) {
    endpoint = `documents/${documentId}/terms`;
  } else if (category) {
    endpoint = `category/${category}/terms`;
  } else if (levelId && type === 'existing') {
    endpoint = `levels/${levelId}/terms`;
  } else {
    endpoint = 'terms'; 
  }

  const { data, error } = useLearning<Term[]>({
    type, 
    endpoint,
    params: { 
      language: queryLanguage,
      ...(queryIndustryId && { industry_id: queryIndustryId })
    },
    enabled: !preferencesLoading
  });

  const terms = data?.data || [];
  const count = data?.count || 0;
  const isEmpty = terms.length === 0;

  const showLoading = !data && !error;

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
        ← Back
      </button>

      <h1>{type === 'existing' ? 'Red Seal' : 'Custom'} Terms</h1>
      
      {error && (
        <div style={{ 
          backgroundColor: '#fee', 
          padding: '1rem', 
          borderRadius: '6px',
          border: '1px solid #fcc',
          marginTop: '1rem'
        }}>
          <strong>Error loading terms</strong>
          <p style={{ margin: '0.5rem 0 0 0' }}>{error}</p>
        </div>
      )}

      {showLoading && (
        <div style={{ 
          padding: '3rem 2rem', 
          textAlign: 'center',
          color: '#666'
        }}>
          <p style={{ margin: 0, fontSize: '1rem' }}>Loading terms...</p>
        </div>
      )}

      {!error && data && (
        <>

          {type === 'existing' && data?.industryCount !== undefined && data?.generalCount !== undefined && (
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              Total: {count} terms
              {queryIndustryId && ` (${data.industryCount} industry, ${data.generalCount} general)`}
            </p>
          )}

          {type === 'custom' && count > 0 && (
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              Total: {count} custom terms
            </p>
          )}

          {isEmpty ? (
            type === 'custom' ? (
              <EmptyState type="terms" />
            ) : (
              <div>
                <p>No terms found for this level.</p>
              </div>
            )
          ) : (
            <div style={{ marginTop: '2rem' }}>
              {terms.map((term, index) => (
                <TermCard
                  key={term.id}
                  term={term}
                  index={index + 1}
                  language={queryLanguage}
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