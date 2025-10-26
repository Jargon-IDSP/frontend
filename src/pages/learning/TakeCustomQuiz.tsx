import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { BACKEND_URL } from '../../lib/api';
import QuizComponent from '../../components/learning/QuizComponent';
import type { UserQuizAttempt, QuizQuestion } from '../../types/learning';

export default function TakeCustomQuiz() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getToken } = useAuth();
  const { language } = useUserPreferences();
  
  const quizId = searchParams.get('quizId');
  const skipHistory = searchParams.get('skipHistory') === 'true';
  const quizNumber = parseInt(searchParams.get('quiz') || '1');

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previousAttempts, setPreviousAttempts] = useState<UserQuizAttempt[]>([]);
  const [showAttempts, setShowAttempts] = useState(true);
  const [loadingAttempts, setLoadingAttempts] = useState(true);

  useEffect(() => {
    if (skipHistory) {
      setLoadingAttempts(false);
      setShowAttempts(false);
    } else if (quizId) {
      fetchPreviousAttempts();
    } else {
      setLoadingAttempts(false);
      setShowAttempts(false);
    }
  }, [quizId, skipHistory]);

  const fetchPreviousAttempts = async () => {
    if (!quizId) return;
    
    try {
      setLoadingAttempts(true);
      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/quiz/${quizId}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.attempts && data.attempts.length > 0) {
          setPreviousAttempts(data.attempts);
          setLoadingAttempts(false);
        } else {
          setShowAttempts(false);
          setLoadingAttempts(false);
        }
      } else {
        setShowAttempts(false);
        setLoadingAttempts(false);
      }
    } catch (err) {
      console.error('Error fetching attempts:', err);
      setShowAttempts(false);
      setLoadingAttempts(false);
    }
  };

  const handleStartNewAttempt = () => {
    setShowAttempts(false);
  };

  useEffect(() => {
    if (!showAttempts && !loadingAttempts) {
      fetchQuiz();
    }
  }, [showAttempts, loadingAttempts]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      let url = '';
      if (quizId) {
        url = `${BACKEND_URL}/quiz/${quizId}/quiz`;
      } else {
        url = `${BACKEND_URL}/learning/custom/quiz/generate?quiz_number=${quizNumber}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quiz');
      }

      const data = await response.json();
      
      if (quizId) {
        setQuestions(data.quiz?.questions || []);
      } else {
        setQuestions(data.data || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = async (score: number, totalQuestions: number) => {
    try {
      const token = await getToken();
      const payload: any = {
        type: 'custom',
        score,
        totalQuestions,
      };

      if (quizId) {
        payload.quizId = quizId;
      }

      await fetch(`${BACKEND_URL}/learning/quiz/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      console.error('Error saving quiz results:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading quiz...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
          ← Back
        </button>
        <div style={{ backgroundColor: '#fee', padding: '1rem', borderRadius: '6px' }}>
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  // Show previous attempts screen
  if (showAttempts && quizId) {
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
          ← Back
        </button>
        
        <h1 style={{ marginBottom: '1.5rem' }}>Quiz Attempts</h1>

        {loadingAttempts ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            Loading previous attempts...
          </div>
        ) : (
          <>
            {previousAttempts.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Previous Attempts</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {previousAttempts.map((attempt, index) => (
                    <div
                      key={attempt.id}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '1.5rem',
                        backgroundColor: '#fff',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
                            Attempt {previousAttempts.length - index}
                          </h3>
                          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
                            {new Date(attempt.startedAt).toLocaleDateString()} at {new Date(attempt.startedAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <span
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '12px',
                            fontWeight: '600',
                            fontSize: '0.875rem',
                            backgroundColor: attempt.completed ? '#d1fae5' : '#fef3c7',
                            color: attempt.completed ? '#065f46' : '#92400e',
                          }}
                        >
                          {attempt.completed ? '✓ Completed' : 'In Progress'}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Score</p>
                          <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: '600' }}>
                            {attempt.pointsEarned} / {attempt.maxPossiblePoints}
                          </p>
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>Accuracy</p>
                          <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: '600' }}>
                            {attempt.percentCorrect}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleStartNewAttempt}
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {previousAttempts.length > 0 ? 'Start New Attempt' : 'Start Quiz'}
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <QuizComponent
      questions={questions}
      quizNumber={quizNumber}
      onComplete={handleQuizComplete}
      onBack={() => navigate(-1)}
      preferredLanguage={language}
    />
  );
}
