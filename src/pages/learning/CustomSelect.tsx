import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { BACKEND_URL } from '../../lib/api';
import { NavigationCard } from '../../components/learning/ui/Card';
import Button from '../../components/learning/ui/Button';
import type { Document } from '../../types/document';

export default function CustomSelect() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${BACKEND_URL}/documents`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.ok) {
          const data = await res.json();
          setDocuments(data.documents || []);
        }
      } catch (err) {
        console.error('Error fetching documents:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [getToken]);

  const ocrProcessedDocs = documents.filter(doc => doc.ocrProcessed);

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Button onClick={() => navigate('/learning')} variant="secondary" style={{ marginBottom: '1rem' }}>
        ← Back to Learning Hub
      </Button>

      <h1>Custom Learning</h1>

      <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Study from a Document</h2>
      {ocrProcessedDocs.length === 0 ? (
        <div style={{ 
          padding: '2rem', 
          backgroundColor: '#f9fafb', 
          borderRadius: '8px',
          textAlign: 'center' 
        }}>
          <p style={{ marginBottom: '1rem' }}>No processed documents yet.</p>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <Button onClick={() => navigate('/documents/user')} variant="primary">
              Go to My Documents
            </Button>
            <Button onClick={() => navigate('/learning/shared')} variant="secondary">
              Shared with Me
            </Button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
          {ocrProcessedDocs.map((doc) => (
            <NavigationCard
              key={doc.id}
              icon="📄"
              title={doc.filename}
              onClick={() => navigate(`/learning/documents/${doc.id}`)}
            />
          ))}
        </div>
      )}

      <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Study by Category</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
        <NavigationCard
          icon="⚠️"
          title="Safety"
          onClick={() => navigate('/learning/custom/categories/safety')}
        />
        <NavigationCard
          icon="🔧"
          title="Technical"
          onClick={() => navigate('/learning/custom/categories/technical')}
        />
        <NavigationCard
          icon="📖"
          title="Training"
          onClick={() => navigate('/learning/custom/categories/training')}
        />
        <NavigationCard
          icon="🏢"
          title="Workplace"
          onClick={() => navigate('/learning/custom/categories/workplace')}
        />
        <NavigationCard
          icon="💼"
          title="Professional"
          onClick={() => navigate('/learning/custom/categories/professional')}
        />
        <NavigationCard
          icon="📝"
          title="General"
          onClick={() => navigate('/learning/custom/categories/general')}
        />
      </div>

      <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Other Options</h2>
      <NavigationCard
        icon="📝"
        title="All Custom Terms"
        description="Review all your custom flashcards"
        onClick={() => navigate('/learning/custom/terms')}
      />
    </div>
  );
}