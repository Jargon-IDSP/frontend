import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import Button from '../../components/learning/ui/Button';
import Card from '../../components/learning/ui/Card';

type QuizType = 'existing' | 'custom';

interface QuizMetadata {
  quizNumber: string;
  type: QuizType;
  levelId?: string;
  industryId?: number;
}

interface InfoRowProps {
  label: string;
  value: string | number;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <p style={{ margin: '0.5rem 0', color: '#6b7280' }}>
      <strong style={{ color: '#1f2937' }}>{label}:</strong> {value}
    </p>
  );
}

function getQuizDescription(type: QuizType): string {
  return type === 'existing'
    ? 'Test your knowledge with Red Seal practice questions.'
    : 'Test your knowledge with custom questions from your documents.';
}

function buildQuizUrl(metadata: QuizMetadata): string {
  const { quizNumber, type, levelId, industryId } = metadata;
  const params = new URLSearchParams();

  params.set('quiz', quizNumber);

  if (industryId) {
    params.set('industry_id', industryId.toString());
  }

  const basePath = type === 'existing' && levelId
    ? `/learning/existing/levels/${levelId}/quiz/take`
    : '/learning/custom/quiz/take';

  return `${basePath}?${params}`;
}

export default function QuizSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const { levelId, quizNumber, sessionNumber } = useParams<{
    levelId?: string;
    quizNumber?: string;
    sessionNumber?: string;
  }>();

  const { industryId } = useUserPreferences();
  const type: QuizType = location.pathname.includes('/existing/') ? 'existing' : 'custom';

  // Use sessionNumber for existing quizzes (Red Seal), quizNumber for custom quizzes
  const actualQuizNumber = sessionNumber || quizNumber || '1';

  const metadata: QuizMetadata = {
    quizNumber: actualQuizNumber,
    type,
    levelId,
    industryId: industryId ?? undefined,
  };

  const handleStartQuiz = () => {
    const url = buildQuizUrl(metadata);
    navigate(url);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Button 
        onClick={() => navigate(-1)} 
        variant="secondary"
        style={{ marginBottom: '1rem' }}
      >
        ← Back
      </Button>

      <h1 style={{ marginBottom: '2rem' }}>Start a Quiz</h1>
      
      <Card style={{ backgroundColor: '#f9fafb', padding: '2rem' }}>
        <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>
          Quiz #{metadata.quizNumber}
        </h2>
        
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          {getQuizDescription(type)}
        </p>

        <div style={{ marginBottom: '1.5rem' }}>
          {type === 'existing' && levelId && (
            <InfoRow label="Level" value={levelId} />
          )}
          {industryId && (
            <InfoRow label="Industry ID" value={industryId} />
          )}
        </div>

        <Button onClick={handleStartQuiz} variant="primary" fullWidth>
          Start Quiz →
        </Button>
      </Card>
    </div>
  );
}