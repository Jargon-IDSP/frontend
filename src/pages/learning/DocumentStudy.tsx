import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { BACKEND_URL } from '../../lib/api';
import { NavigationCard } from '../../components/learning/ui/Card';
import Button from '../../components/learning/ui/Button';
import QuizShareModal from '../../components/learning/QuizShareModal';
import type { CustomQuiz } from '../../types/learning';

interface Document {
  id: string;
  filename: string;
  userId: string;
}

export default function DocumentStudy() {
  const navigate = useNavigate();
  const { documentId } = useParams<{ documentId: string }>();
  const { getToken, userId } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [quizzes, setQuizzes] = useState<CustomQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOwnership, setCheckingOwnership] = useState(true);
  const [shareModalQuiz, setShareModalQuiz] = useState<{ id: string; name: string } | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);

  // Check ownership FIRST before loading anything else
  useEffect(() => {
    const checkOwnership = async () => {
      if (!documentId || !userId) {
        setCheckingOwnership(false);
        return;
      }

      try {
        const token = await getToken();
        const response = await fetch(`${BACKEND_URL}/documents/${documentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.document.userId !== userId) {
            // User does NOT own this document - check if they have shared access
            
            // Check if any quizzes from this document have been shared with them
            const sharedResponse = await fetch(`${BACKEND_URL}/learning/sharing/shared-with-me`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (sharedResponse.ok) {
              const sharedData = await sharedResponse.json();
              const hasSharedAccess = sharedData.data?.some(
                (quiz: any) => quiz.documentId === documentId
              );

              if (hasSharedAccess) {
                // User has shared access - redirect to shared page
                navigate('/learning/shared', { replace: true });
              } else {
                // User has NO access - redirect to their own learning
                navigate('/learning/custom', { replace: true });
              }
            } else {
              // Couldn't check shared access - redirect to custom learning
              navigate('/learning/custom', { replace: true });
            }
            return;
          }
          
          // User owns the document
          setIsOwner(true);
        } else {
          // Document not found or error
          navigate('/learning/custom', { replace: true });
        }
      } catch (err) {
        console.error('Error checking document ownership:', err);
        navigate('/learning/custom', { replace: true });
      } finally {
        setCheckingOwnership(false);
      }
    };

    checkOwnership();
  }, [documentId, userId, getToken, navigate]);

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

      navigate('/learning/custom');
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Failed to delete document');
    }
  };

  useEffect(() => {
    // Only fetch data if ownership check is complete and user is owner
    if (!isOwner || checkingOwnership) {
      return;
    }

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

        // NEW ROUTE: /learning/documents/:documentId/quizzes
        const quizzesRes = await fetch(`${BACKEND_URL}/learning/documents/${documentId}/quizzes`, {
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
  }, [documentId, getToken, isOwner, checkingOwnership]);

  // Show loading while checking ownership
  if (checkingOwnership) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Don't render anything if not owner (will redirect)
  if (!isOwner) {
    return null;
  }

  // Show loading while fetching document data
  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Button 
        onClick={() => navigate('/learning/custom')} 
        variant="secondary"
        style={{ marginBottom: '1rem' }}
      >
        ← Back to Custom Learning
      </Button>

      <h1>Study: {document?.filename || 'Document'}</h1>

      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        Choose how you want to study this document:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <NavigationCard
          icon="📚"
          title="Study Flashcards"
          description="Review terms and definitions"
          onClick={() => navigate(`/learning/documents/${documentId}/terms`)}
        />

        <NavigationCard
          icon="🎯"
          title="Take Quiz"
          description="Test your knowledge"
          onClick={() => navigate(`/learning/documents/${documentId}/quizzes`)}
        />

        <NavigationCard
          icon="🌐"
          title="View Translation"
          description="See document in other languages"
          onClick={() => navigate(`/documents/${documentId}/translation`)}
        />

        {isOwner && quizzes.length > 0 && (
          <Button
            onClick={() => setShareModalQuiz({ id: quizzes[0].id, name: quizzes[0].name })}
            variant="success"
            fullWidth
          >
            🤝 Share Quiz with Friends
          </Button>
        )}
      </div>

      {shareModalQuiz && (
        <QuizShareModal
          quizId={shareModalQuiz.id}
          quizName={shareModalQuiz.name}
          onClose={() => setShareModalQuiz(null)}
          onShared={() => setShareModalQuiz(null)}
        />
      )}

      {isOwner && (
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
          <Button onClick={handleDelete} variant="danger">
            🗑️ Delete Document
          </Button>
        </div>
      )}
    </div>
  );
}