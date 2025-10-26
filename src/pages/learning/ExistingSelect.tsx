import { useNavigate, useParams } from 'react-router-dom';
import { NavigationCard } from '../../components/learning/ui/Card'
import Button from '../../components/learning/ui/Button';

export default function ExistingSelect() {
  const navigate = useNavigate();
  const { levelId } = useParams<{ levelId: string }>();

  const getLevelName = (id: string) => {
    const levels: Record<string, string> = {
      '1': 'Foundation',
      '2': 'Intermediate',
      '3': 'Advanced'
    };
    return levels[id] || 'Level ' + id;
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <Button 
        onClick={() => navigate('/learning/existing/levels')} 
        variant="secondary"
        style={{ marginBottom: '1rem' }}
      >
        ← Back to Levels
      </Button>

      <h1>{getLevelName(levelId || '')} Level</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Choose how you'd like to study:</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <NavigationCard
          icon="📝"
          title="Study Terms"
          description="Review flashcards and practice terminology"
          onClick={() => navigate(`/learning/existing/levels/${levelId}/terms`)}
        />

        <NavigationCard
          icon="🎯"
          title="Take Quiz"
          description="Test your knowledge with a quiz"
          onClick={() => navigate(`/learning/existing/levels/${levelId}/quiz`)}
        />
      </div>
    </div>
  );
}