import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import type { EmptyStateProps } from '../../types/emptyState';
import '../../styles/components/_emptyState.scss';

const config = {
  terms: {
    message: 'No custom terms yet',
    description: 'Upload a document to create your custom flashcards',
  },
  questions: {
    message: 'No custom questions yet',
    description: 'Upload a document to generate practice questions',
  },
  quizzes: {
    message: 'No custom quizzes yet',
    description: 'Upload a document to create custom quizzes',
  },
};

export default function EmptyState({ type }: EmptyStateProps) {
  const navigate = useNavigate();
  const { message, description } = config[type];

  return (
    <div className="empty-state">
      <h3 className="empty-state__title">{message}</h3>
      <p className="empty-state__description">{description}</p>
      <Button onClick={() => navigate('/documents')} variant="primary">
        Go to Documents
      </Button>
    </div>
  );
}