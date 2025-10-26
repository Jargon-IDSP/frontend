import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useLearning } from '../../hooks/useLearning';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import QuizCard from '../../components/learning/QuizCard';
import EmptyState from '../../components/learning/EmptyState';
import type { Quiz, CustomQuiz, UserQuizAttempt } from '../../types/learning';
import { BACKEND_URL } from '../../lib/api';

export default function Quizzes() { 
  const navigate = useNavigate();
  const location = window.location;
  const { getToken, userId } = useAuth();
  const { type, levelId, documentId, category } = useParams<{ 
    type?: 'existing' | 'custom'; 
    levelId?: string;
    documentId?: string;
    category?: string;
  }>();
  const [searchParams] = useSearchParams();
  const [attempts, setAttempts] = useState<UserQuizAttempt[]>([]);
  const [documentOwnerId, setDocumentOwnerId] = useState<string | null>(null);
  
  const { language, industryId, loading: preferencesLoading } = useUserPreferences();
  
  const queryLanguage = searchParams.get('language') || language;
  const queryIndustryId = searchParams.get('industry_id') || industryId?.toString();

  const actualType = location.pathname.includes('/existing/') ? 'existing' : 'custom';

  let endpoint = '';
  if (documentId) {
    endpoint = `documents/${documentId}/quizzes`;  
  } else if (category) {
    endpoint = `categories/${category}/quizzes`;  // Fixed: categories (plural)
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

  const documentName = documentId && quizzes.length > 0 && 'document' in quizzes[0] && quizzes[0].document 
    ? quizzes[0].document.filename 
    : null;

  // Check document ownership and shared access
  useEffect(() => {
    const checkDocumentOwnership = async () => {
      if (!documentId || !userId) return;
      
      try {
        const token = await getToken();
        const response = await fetch(`${BACKEND_URL}/documents/${documentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const docData = await response.json();
          const ownerId = docData.document?.userId || docData.userId;
          setDocumentOwnerId(ownerId);
          
          console.log('Quizzes ownership check:', { ownerId, userId, isOwner: ownerId === userId });
          
          // If user IS the owner, allow access
          if (ownerId === userId) {
            console.log('User is owner, allowing access');
            return;
          }
          
          // User is NOT the owner - check if they have shared access
          console.log('User is not owner, checking shared access...');
          const sharedResponse = await fetch(`${BACKEND_URL}/learning/sharing/shared-with-me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (sharedResponse.ok) {
            const sharedData = await sharedResponse.json();
            const hasSharedAccess = sharedData.data?.some(
              (quiz: any) => quiz.documentId === documentId
            );

            console.log('Has shared access:', hasSharedAccess);

            if (hasSharedAccess) {
              // User has shared access - allow them to stay
              console.log('User has shared access, allowing access');
            } else {
              // User has NO access - redirect to their own learning
              console.log('User has no access, redirecting to /learning/custom');
              navigate('/learning/custom', { replace: true });
            }
          } else {
            // Couldn't check shared access - redirect to custom learning
            console.log('Could not check shared access, redirecting to /learning/custom');
            navigate('/learning/custom', { replace: true });
          }
        }
      } catch (err) {
        console.error('Error checking document ownership:', err);
      }
    };
    
    checkDocumentOwnership();
  }, [documentId, userId, getToken, navigate]);

  useEffect(() => {
    const fetchAttempts = async () => {
      if (actualType !== 'custom' || quizzes.length === 0) return;
      
      try {
        const token = await getToken();
        const quizId = quizzes[0]?.id; 
        
        if (!quizId) return;
        
        const response = await fetch(`${BACKEND_URL}/quiz/${quizId}/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.attempts) {
            setAttempts(data.attempts);
          }
        }
      } catch (err) {
        console.error('Error fetching attempts:', err);
      }
    };
    
    fetchAttempts();
  }, [quizzes, actualType, getToken]);

  const showLoading = !data && !error;

  const handleBack = () => {
    if (documentId) {
      // Smart back navigation based on document ownership
      if (documentOwnerId && userId && documentOwnerId !== userId) {
        // User is NOT the owner (shared user) - go to shared quizzes
        navigate('/learning/shared');
        return;
      }
      // User IS the owner - go to document study page
      navigate(`/learning/documents/${documentId}`);
    } else if (category) {
      navigate(`/learning/custom/categories/${category}`);
    } else {
      navigate(-1);
    }
  };

  if (showLoading) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ 
          padding: '3rem 2rem', 
          textAlign: 'center',
          color: '#666'
        }}>
          <p style={{ margin: 0, fontSize: '1rem' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={handleBack} style={{ marginBottom: '1rem' }}>
        ← Back
      </button>

      <h1>{documentName || (documentId ? 'Document Quiz' : (type === 'existing' ? 'Red Seal' : 'Custom'))} Quiz History</h1>
      
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
            <>
              <div style={{ marginTop: '2rem' }}>
                <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>
                  {documentId ? 'Take Quiz' : 'Available Quizzes'}
                </h2>
                {quizzes.slice(0, documentId ? 1 : quizzes.length).map((quiz, index) => (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    index={index + 1}
                    type={actualType}
                    hasAttempts={attempts.length > 0}
                    category={category}
                  />
                ))}
              </div>

              {actualType === 'custom' && documentId && (
                <div style={{ marginTop: '3rem' }}>
                  <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
                    Your Attempts {attempts.length > 0 ? `(${attempts.length})` : ''}
                  </h2>
                  {attempts.length > 0 ? (
                    attempts.map((attempt, index) => (
                      <QuizCard
                        key={attempt.id}
                        quiz={attempt}
                        index={index + 1}
                        type={actualType}
                      />
                    ))
                  ) : (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>
                      No attempts yet. Take the quiz above to see your history here.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}