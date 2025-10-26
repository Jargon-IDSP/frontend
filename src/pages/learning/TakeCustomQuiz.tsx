import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { BACKEND_URL } from '../../lib/api';
import QuizComponent from '../../components/learning/QuizComponent';
import type { QuizQuestion } from '../../types/learning';

export default function TakeCustomQuiz() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getToken } = useAuth();
  const { language } = useUserPreferences();
  
  const quizId = searchParams.get('quizId');
  const quizNumber = parseInt(searchParams.get('quiz') || '1');

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('TakeCustomQuiz rendered', { quizId, loading });

  useEffect(() => {
    fetchQuiz();
  }, [quizId, quizNumber]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      
      let url = '';
      if (quizId) {
        // Fetch specific quiz from attempts endpoint
        url = `${BACKEND_URL}/learning/attempts/${quizId}`;
      } else {
        // Generate new quiz
        url = `${BACKEND_URL}/learning/custom/quiz/generate?quiz_number=${quizNumber}`;
      }

      console.log('Fetching quiz from:', url);
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        console.error('Quiz fetch failed:', response.status, await response.text());
        throw new Error('Failed to fetch quiz');
      }

      const data = await response.json();
      console.log('Quiz data received:', data);
      
      // Handle different response structures
      if (data.quiz?.questions) {
        setQuestions(data.quiz.questions);
      } else if (data.questions) {
        setQuestions(data.questions);
      } else if (data.data) {
        setQuestions(data.data);
      } else {
        console.error('Unexpected data structure:', data);
        throw new Error('Invalid quiz data structure');
      }
    } catch (err: any) {
      console.error('Error fetching quiz:', err);
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

      // FIXED: /learning/attempts/complete
      await fetch(`${BACKEND_URL}/learning/attempts/complete`, {
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