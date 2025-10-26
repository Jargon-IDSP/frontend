import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';

interface EmptyStateProps {
  type: 'terms' | 'questions' | 'quizzes';
}

const config = {
  terms: {
    icon: '📚',
    message: 'No custom terms yet',
    description: 'Upload a document to create your custom flashcards',
  },
  questions: {
    icon: '❓',
    message: 'No custom questions yet',
    description: 'Upload a document to generate practice questions',
  },
  quizzes: {
    icon: '🎯',
    message: 'No custom quizzes yet',
    description: 'Upload a document to create custom quizzes',
  },
};

export default function EmptyState({ type }: EmptyStateProps) {
  const navigate = useNavigate();
  const { icon, message, description } = config[type];

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '3rem 2rem',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#1f2937' }}>
        {message}
      </h3>
      <p style={{ margin: '0 0 1.5rem 0', color: '#6b7280' }}>{description}</p>
      <Button onClick={() => navigate('/documents')} variant="primary">
        Go to Documents
      </Button>
    </div>
  );
}