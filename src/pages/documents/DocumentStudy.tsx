import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { BACKEND_URL } from '../../lib/api';

interface Document {
  id: string;
  filename: string;
}

export default function DocumentStudy() {
  const navigate = useNavigate();
  const { documentId } = useParams<{ documentId: string }>();
  const { getToken } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${BACKEND_URL}/documents/${documentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.ok) {
          const data = await res.json();
          setDocument(data.document);
        }
      } catch (err) {
        console.error('Error fetching document:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId, getToken]);

  if (loading) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => navigate(`/learning/custom`)}>
        ← Back to Custom Learning
      </button>

      <h1>Study: {document?.filename || 'Document'}</h1>

      <p>Choose how you want to study this document:</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        <button onClick={() => navigate(`/learning/custom/documents/${documentId}/terms`)}>
          📚 Study Flashcards
        </button>

        <button onClick={() => navigate(`/learning/custom/documents/${documentId}/quizzes`)}>
          🎯 Take Quiz
        </button>
      </div>
    </div>
  );
}
