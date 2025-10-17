import { useNavigate, useParams } from 'react-router-dom';
import PracticeType from '../../components/learning/PracticeType';

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
    <div style={{ padding: '2rem' }}>
      <button 
        onClick={() => navigate('/learning/existing/levels')} 
        style={{ marginBottom: '1rem' }}
      >
        ← Back to Levels
      </button>

      <h1>{getLevelName(levelId || '')} Level</h1>
      <p>Choose how you'd like to study:</p>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1rem', 
        marginTop: '2rem',
        maxWidth: '600px'
      }}>
        <PracticeType
          icon="📝"
          title="Study Terms"
          description="Review flashcards and practice terminology"
          onClick={() => navigate(`/learning/existing/levels/${levelId}/terms`)}
        />

        <PracticeType
          icon="🎯"
          title="Take Quiz"
          description="Test your knowledge with a quiz"
          onClick={() => navigate(`/learning/existing/levels/${levelId}/quiz`)}
        />
      </div>
    </div>
  );
}