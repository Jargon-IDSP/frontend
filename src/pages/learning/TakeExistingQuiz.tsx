import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { BACKEND_URL } from '../../lib/api';
import QuizComponent from '../../components/learning/QuizComponent';
import type { QuizQuestion } from '../../types/learning';

export default function TakeExistingQuiz() {
  const navigate = useNavigate();
  const { levelId } = useParams<{ levelId: string }>();
  const [searchParams] = useSearchParams();
  const { getToken } = useAuth();
  const { language, industryId } = useUserPreferences();
  
  const quizNumber = parseInt(searchParams.get('quiz') || '1');
  const queryIndustryId = searchParams.get('industry_id') || industryId?.toString();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuiz();
  }, []);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      // Always fetch quiz in English, users can translate on-demand
      let url = `${BACKEND_URL}/learning/existing/levels/${levelId}/quiz/generate?quiz_number=${quizNumber}&language=english`;
      if (queryIndustryId) {
        url += `&industry_id=${queryIndustryId}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quiz');
      }

      const data = await response.json();
      setQuestions(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = async (score: number, totalQuestions: number) => {
    try {
      const token = await getToken();
      const payload = {
        type: 'existing',
        score,
        totalQuestions,
        levelId,
        quizId: `quiz-${levelId}-${Date.now()}`,
      };

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
        <button onClick={() => navigate('/learning/existing/levels')} style={{ marginBottom: '1rem' }}>
          ← Back
        </button>
        <div style={{ backgroundColor: '#fee', padding: '1rem', borderRadius: '6px' }}>
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  return (
    <QuizComponent
      questions={questions}
      quizNumber={quizNumber}
      onComplete={handleQuizComplete}
      onBack={() => navigate('/learning/existing/levels')}
      preferredLanguage={language}
    />
  );
}
