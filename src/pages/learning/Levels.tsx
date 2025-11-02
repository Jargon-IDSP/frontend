import { useNavigate } from 'react-router-dom';
import { NavigationCard } from '../../components/learning/ui/Card';
import Button from '../../components/learning/ui/Button';

export default function ExistingLevels() {
  const navigate = useNavigate();

  const levels = [
    { id: 1, name: 'Foundation', description: 'Basic trades terminology' },
    { id: 2, name: 'Intermediate', description: 'Common trade practices' },
    { id: 3, name: 'Advanced', description: 'Complex technical concepts' },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <Button
          onClick={() => navigate('/learning/custom')}
          variant="secondary"
        >
          Study Custom Content
        </Button>
      </div>

      <h1>Red Seal Apprentice Levels</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        Choose your apprenticeship level to start studying trades jargon:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {levels.map((level) => (
          <NavigationCard
            key={level.id}
            title={`Level ${level.id}: ${level.name}`}
            description={level.description}
            onClick={() => navigate(`/learning/existing/levels/${level.id}`)}
          />
        ))}
      </div>
    </div>
  );
}