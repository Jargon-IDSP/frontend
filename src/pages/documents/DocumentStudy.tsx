import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { BACKEND_URL } from '../../lib/api';
import QuizShareModal from '../../components/learning/QuizShareModal';

interface Document {
  id: string;
  filename: string;
}

interface CustomQuiz {
  id: string;
  name: string;
  category: string | null;
}

export default function DocumentStudy() {
  const navigate = useNavigate();
  const { documentId } = useParams<{ documentId: string }>();
  const { getToken } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [quizzes, setQuizzes] = useState<CustomQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareModalQuiz, setShareModalQuiz] = useState<{ id: string; name: string } | null>(null);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document? This will also delete all associated flashcards and quizzes.')) {
      return;
    }

    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete document');
      }

      // Navigate back to custom learning page
      navigate('/learning/custom');
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Failed to delete document');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        
        // Fetch document
        const docRes = await fetch(`${BACKEND_URL}/documents/${documentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (docRes.ok) {
          const docData = await docRes.json();
          setDocument(docData.document);
        }

        // Fetch quizzes for this document
        const quizzesRes = await fetch(`${BACKEND_URL}/learning/custom/documents/${documentId}/quizzes`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (quizzesRes.ok) {
          const quizzesData = await quizzesRes.json();
          setQuizzes(quizzesData.data || []);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

        {quizzes.length > 0 && (
          <button 
            onClick={() => setShareModalQuiz({ id: quizzes[0].id, name: quizzes[0].name })}
            style={{ backgroundColor: '#10b981' }}
          >
            🤝 Share Quiz
          </button>
        )}
      </div>

      {shareModalQuiz && (
        <QuizShareModal
          quizId={shareModalQuiz.id}
          quizName={shareModalQuiz.name}
          onClose={() => setShareModalQuiz(null)}
          onShared={() => {
            // Optional callback after sharing
          }}
        />
      )}

      <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
        <button 
          onClick={handleDelete}
          style={{ 
            backgroundColor: '#ef4444', 
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🗑️ Delete Document
        </button>
      </div>
    </div>
  );
}
