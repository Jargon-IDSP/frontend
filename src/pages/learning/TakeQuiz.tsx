import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import { BACKEND_URL } from '../../lib/api';
import TranslateButton from '../../components/TranslateButton';

interface QuizQuestion {
  questionId: string;
  prompt: string;
  choices: {
    id: string;
    term: string;
    isCorrect: boolean;
    termId: string;
  }[];
  difficulty: number;
  tags: string[];
  correctAnswerId: string;
}

export default function TakeQuiz() {
  const navigate = useNavigate();
  const location = useLocation();
  const { levelId } = useParams<{ levelId?: string }>();
  const [searchParams] = useSearchParams();
  const { getToken } = useAuth();
  const { language, industryId } = useUserPreferences();
  
  const type = location.pathname.includes('/existing/') ? 'existing' : 'custom';
  
  const quizNumber = parseInt(searchParams.get('quiz') || '1');
  const queryIndustryId = searchParams.get('industry_id') || industryId?.toString();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuiz();
  }, []);

const fetchQuiz = async () => {
  try {
    setLoading(true);
    const token = await getToken();
    
    let url = '';
    if (type === 'existing' && levelId) {
      url = `${BACKEND_URL}/learning/existing/levels/${levelId}/quiz/generate?quiz_number=${quizNumber}&language=english`;
      if (queryIndustryId) {
        url += `&industry_id=${queryIndustryId}`;
      }
    } else {
      url = `${BACKEND_URL}/learning/custom/quiz/generate?quiz_number=${quizNumber}&language=english`;
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
  const handleAnswerSelect = (choiceId: string) => {
    setSelectedAnswer(choiceId);
  };

  const handleNext = () => {
    if (selectedAnswer) {
      setAnswers({ ...answers, [currentQuestionIndex]: selectedAnswer });
      
      const currentQuestion = questions[currentQuestionIndex];
      const selectedChoice = currentQuestion.choices.find(c => c.id === selectedAnswer);
      if (selectedChoice?.isCorrect) {
        setScore(score + 1);
      }

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
      } else {
        setIsComplete(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1] || null);
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers({});
    setScore(0);
    setIsComplete(false);
    fetchQuiz();
  };

  const handleTranslate = async (toLanguage: string) => {
    const token = await getToken();
    let url = '';
    
    if (type === 'existing' && levelId) {
      url = `${BACKEND_URL}/learning/existing/levels/${levelId}/quiz/generate?quiz_number=${quizNumber}&language=${toLanguage}`;
      if (queryIndustryId) {
        url += `&industry_id=${queryIndustryId}`;
      }
    } else {
      url = `${BACKEND_URL}/learning/custom/quiz/generate?quiz_number=${quizNumber}&language=${toLanguage}`;
    }

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const data = await response.json();
      return data.data?.[currentQuestionIndex]?.prompt || questions[currentQuestionIndex].prompt;
    }
    
    return questions[currentQuestionIndex].prompt;
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

  if (questions.length === 0) {
    return (
      <div style={{ padding: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
          ← Back
        </button>
        <div style={{ 
          backgroundColor: '#f0f0f0', 
          padding: '2rem', 
          borderRadius: '6px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '1.1rem', color: '#666' }}>
            No questions available for this quiz. Please try again or select a different quiz.
          </p>
        </div>
      </div>
    );
  }

  if (isComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Quiz Complete! 🎉</h1>
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '2rem',
          borderRadius: '8px',
          marginTop: '2rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            {percentage >= 80 ? '🌟' : percentage >= 60 ? '👍' : '📚'}
          </div>
          <h2 style={{ margin: 0, marginBottom: '1rem' }}>
            Your Score: {score} / {questions.length}
          </h2>
          <p style={{ fontSize: '1.5rem', color: '#3b82f6', fontWeight: '600' }}>
            {percentage}%
          </p>
          <div style={{
            width: '100%',
            height: '20px',
            backgroundColor: '#e5e7eb',
            borderRadius: '10px',
            marginTop: '1rem',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${percentage}%`,
              height: '100%',
              backgroundColor: percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444',
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            onClick={handleRetry}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => navigate(-1)}
            style={{
              flex: 1,
              padding: '0.75rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Back to Learning
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
          ← Back
        </button>
        <h1>Quiz {quizNumber}</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#666' }}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span style={{ color: '#666' }}>
            Score: {score} / {currentQuestionIndex}
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#e5e7eb',
          borderRadius: '4px',
          marginTop: '0.5rem',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            height: '100%',
            backgroundColor: '#3b82f6',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      <div style={{
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem',
      }}>
        <TranslateButton
        text={currentQuestion.prompt}
        preferredLanguage={language}
        onTranslate={handleTranslate}
      />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {currentQuestion.choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => handleAnswerSelect(choice.id)}
              style={{
                padding: '1rem',
                textAlign: 'left',
                backgroundColor: selectedAnswer === choice.id ? '#dbeafe' : '#f9fafb',
                border: `2px solid ${selectedAnswer === choice.id ? '#3b82f6' : '#e5e7eb'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: selectedAnswer === choice.id ? '600' : '400',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ marginRight: '1rem', fontWeight: '700' }}>{choice.id}.</span>
              {choice.term}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: currentQuestionIndex === 0 ? '#e5e7eb' : '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
            fontWeight: '600',
          }}
        >
          ← Previous
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedAnswer}
          style={{
            flex: 1,
            padding: '0.75rem 1.5rem',
            backgroundColor: !selectedAnswer ? '#e5e7eb' : '#3b82f6',
            color: !selectedAnswer ? '#9ca3af' : 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: !selectedAnswer ? 'not-allowed' : 'pointer',
            fontWeight: '600',
          }}
        >
          {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next →'}
        </button>
      </div>
    </div>
  );
}