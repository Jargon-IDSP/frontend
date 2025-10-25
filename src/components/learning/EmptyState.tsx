import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  type: 'terms' | 'questions' | 'quizzes';
}

export default function EmptyState({ type }: EmptyStateProps) {
  const navigate = useNavigate();

  const messages = {
    terms: 'Upload a document to create your custom terms',
    questions: 'Upload a document to create your custom questions',
    quizzes: 'Upload a document to create your custom quizzes',
  };

  return (
    <div>
      <p>{messages[type]}</p>
      <button onClick={() => navigate('/documents')}>
        Go to Documents
      </button>
    </div>
  );
}
