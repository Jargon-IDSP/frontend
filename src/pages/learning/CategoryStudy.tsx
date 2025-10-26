import { useParams, useNavigate } from 'react-router-dom';

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
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate('/learning/custom')} style={{ marginBottom: '1rem' }}>
        ← Back to Custom Learning
      </button>

      <h1>{categoryEmoji} {categoryName} Category</h1>

      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Choose how you want to study {categoryName.toLowerCase()} content:
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        <button onClick={() => navigate(`/learning/custom/category/${category}/terms`)}>
          📚 Study Flashcards
        </button>

        <button onClick={() => navigate(`/learning/custom/category/${category}/quizzes`)}>
          🎯 Take Quiz
        </button>
        
      </div>
    </div>
  );
}
