import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { BACKEND_URL } from "../../lib/api";
import PracticeType from '../../components/learning/PracticeType';
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

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <button onClick={() => navigate('/learning')}>
        ← Back to Learning Hub
      </button>

      <h1>Custom Learning</h1>

      <h2>Study from a Document</h2>
      {ocrProcessedDocs.length === 0 ? (
        <div>
          <p>No processed documents yet.</p>
          <button onClick={() => navigate('/documents/user')}>
            Go to My Documents
          </button>
          <button onClick={() => navigate('/learning/shared')}>
            Documents Shared with Me
          </button>
        </div>
      ) : (
        <div style={{ marginBottom: '2rem' }}>
          {ocrProcessedDocs.map((doc) => (    
            <button
              key={doc.id}
              onClick={() => navigate(`/study/${doc.id}`)}
              style={{ 
                display: 'block',
                width: '100%',
                padding: '1rem',
                marginBottom: '0.5rem',
                textAlign: 'left',
              }}
            >
              📄 {doc.filename}
            </button>
          ))}
        </div>
      )}

      <h2>Study by Category</h2>
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => navigate('/learning/custom/category/safety')}>
          ⚠️ Safety
        </button>
        <button onClick={() => navigate('/learning/custom/category/technical')}>
          🔧 Technical
        </button>
        <button onClick={() => navigate('/learning/custom/category/training')}>
          📖 Training
        </button>
        <button onClick={() => navigate('/learning/custom/category/workplace')}>
          🏢 Workplace
        </button>
        <button onClick={() => navigate('/learning/custom/category/professional')}>
          💼 Professional
        </button>
        <button onClick={() => navigate('/learning/custom/category/general')}>
          📝 General
        </button>
      </div>

      <h2>Other Options</h2>
      <PracticeType
        icon="📝"
        title="All Custom Terms"
        description="Review all your custom flashcards"
        onClick={() => navigate('/learning/custom/terms')}
      />


      {/* <PracticeType
        icon="🎯"
        title="Take Custom Quiz"
        description="Test your knowledge with a quiz on your custom terms"
        onClick={() => navigate('/learning/custom/quiz')}
      /> */}
    </div>
  );
}