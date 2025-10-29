import { useParams, useNavigate } from 'react-router-dom';
import { NavigationCard } from '../../components/learning/ui/Card';
import Button from "../../components/learning/ui/Button";

const categoryNames: Record<string, string> = {
  'safety': 'Safety',
  'technical': 'Technical',
  'training': 'Training',
  'workplace': 'Workplace',
  'professional': 'Professional',
  'general': 'General'
};

const categoryEmojis: Record<string, string> = {
  'safety': '⚠️',
  'technical': '🔧',
  'training': '📖',
  'workplace': '🏢',
  'professional': '💼',
  'general': '📝'
};

export default function CategoryStudy() {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  
  const categoryName = category ? categoryNames[category.toLowerCase()] || category : 'Category';
  const categoryEmoji = category ? categoryEmojis[category.toLowerCase()] || '📚' : '📚';

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <Button 
        onClick={() => navigate('/learning/custom')} 
        variant="secondary"
        style={{ marginBottom: '1rem' }}
      >
        ← Back to Custom Learning
      </Button>

      <h1>{categoryEmoji} {categoryName} Category</h1>

      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        Choose how you want to study {categoryName.toLowerCase()} content:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <NavigationCard
          icon="📚"
          title="Study Flashcards"
          description="Review terms and definitions"
          onClick={() => navigate(`/learning/custom/categories/${category}/terms`)}
        />

        <NavigationCard
          icon="🎯"
          title="Take Quiz"
          description="Test your knowledge"
          onClick={() => navigate(`/learning/custom/categories/${category}/quizzes`)}
        />
      </div>
    </div>
  );
}