import { useParams, useNavigate } from 'react-router-dom';
import Button from "../../components/learning/ui/Button";
import { useDocumentsByCategory } from '../../hooks/useDocumentsByCategory';

const categoryNames: Record<string, string> = {
  'safety': 'Safety',
  'technical': 'Technical',
  'training': 'Training',
  'workplace': 'Workplace',
  'professional': 'Professional',
  'general': 'General'
};


export default function CategoryStudy() {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();

  const categoryName = category ? categoryNames[category.toLowerCase()] || category : 'Category';

  const { data: documents = [], isLoading } = useDocumentsByCategory(category || 'general');

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Button
        onClick={() => navigate('/learning/custom/categories')}
        variant="secondary"
        style={{ marginBottom: '1rem' }}
      >
        ← Back to My Generated Lessons
      </Button>

      <h1>{categoryName} Category</h1>

      <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        Study by Document
      </h2>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          Loading documents...
        </div>
      ) : documents.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          color: '#6b7280'
        }}>
          <p>No documents in the {categoryName} category yet.</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Upload and process documents to see them here!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => navigate(`/learning/documents/${doc.id}/study`)}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1.5rem',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                📄 {doc.filename}
              </h3>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                {doc.flashcardCount} flashcards • {doc.questionCount} questions
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
