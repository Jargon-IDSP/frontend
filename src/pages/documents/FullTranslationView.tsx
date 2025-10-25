import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { BACKEND_URL } from '../../lib/api';
import type { Translation, DocumentStatus } from '../../types/document';

export default function DocumentTranslationView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [status, setStatus] = useState<DocumentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLanguages, setExpandedLanguages] = useState<Set<string>>(new Set(['english']));

  useEffect(() => {
    fetchData();
    
    // Poll for status updates every 3 seconds while processing
    const interval = setInterval(() => {
      if (status?.status === 'processing') {
        fetchStatus();
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [id, status?.status]);

  const fetchData = async () => {
    try {
      const token = await getToken();
      
      // Fetch translation data
      const translationRes = await fetch(`${BACKEND_URL}/documents/${id}/translation`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (translationRes.ok) {
        const data = await translationRes.json();
        setTranslation(data.translation);
      }
      
      // Fetch status
      await fetchStatus();
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load document data');
      setLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const token = await getToken();
      const statusRes = await fetch(`${BACKEND_URL}/documents/${id}/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (statusRes.ok) {
        const data = await statusRes.json();
        setStatus(data.status);
      }
    } catch (err) {
      console.error('Error fetching status:', err);
    }
  };

  const toggleLanguage = (lang: string) => {
    const newSet = new Set(expandedLanguages);
    if (newSet.has(lang)) {
      newSet.delete(lang);
    } else {
      newSet.add(lang);
    }
    setExpandedLanguages(newSet);
  };

  const goToFlashcards = () => {
    if (status?.hasFlashcards && id) {
      navigate(`/documents/${id}/flashcards`);
    }
  };

  const goToQuiz = () => {
    if (status?.hasQuiz && translation) {
      // Find the quiz ID from the document
      const quizId = translation.document.customQuizzes?.[0]?.id;
      if (quizId) {
        navigate(`/custom-quiz/${quizId}`);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🔄 Processing Document...</h2>
        <p style={{ color: '#6b7280' }}>Extracting text, translating, and generating flashcards...</p>
        <div style={{ marginTop: '1rem', fontSize: '2rem' }}>⏳</div>
      </div>
    );
  }

  if (error || !translation) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <button onClick={() => navigate('/documents')} style={{ marginBottom: '1rem' }}>
          ← Back to Documents
        </button>
        <h2 style={{ color: '#ef4444' }}>Error</h2>
        <p>{error || 'Translation not found. The document may still be processing.'}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Refresh Page
        </button>
      </div>
    );
  }

  const languages = [
    { code: 'english', name: '🇬🇧 English', text: translation.textEnglish },
    { code: 'french', name: '🇫🇷 French', text: translation.textFrench },
    { code: 'chinese', name: '🇨🇳 Chinese', text: translation.textChinese },
    { code: 'spanish', name: '🇪🇸 Spanish', text: translation.textSpanish },
    { code: 'tagalog', name: '🇵🇭 Tagalog', text: translation.textTagalog },
    { code: 'punjabi', name: '🇮🇳 Punjabi', text: translation.textPunjabi },
    { code: 'korean', name: '🇰🇷 Korean', text: translation.textKorean },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => navigate('/documents')} style={{ marginBottom: '1rem' }}>
          ← Back to Documents
        </button>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>
          {translation.document.filename}
        </h1>
        <p style={{ color: '#6b7280' }}>
          Uploaded on {new Date(translation.document.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Status Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ 
          padding: '1rem', 
          border: '2px solid #e5e7eb', 
          borderRadius: '8px',
          backgroundColor: status?.hasTranslation ? '#f0fdf4' : '#fef2f2'
        }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Translation
          </h3>
          <p style={{ fontSize: '1.5rem' }}>
            {status?.hasTranslation ? '✅' : '⏳'}
          </p>
          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            {status?.hasTranslation ? 'Complete' : 'Processing'}
          </p>
        </div>

        <div style={{ 
          padding: '1rem', 
          border: '2px solid #e5e7eb', 
          borderRadius: '8px',
          backgroundColor: status?.hasFlashcards ? '#f0fdf4' : '#fef2f2'
        }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Flashcards
          </h3>
          <p style={{ fontSize: '1.5rem' }}>
            {status?.flashcardCount || 0}
          </p>
          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            {status?.hasFlashcards ? 'Generated' : 'Processing'}
          </p>
        </div>

        <div style={{ 
          padding: '1rem', 
          border: '2px solid #e5e7eb', 
          borderRadius: '8px',
          backgroundColor: status?.hasQuiz ? '#f0fdf4' : '#fef2f2'
        }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Quiz Questions
          </h3>
          <p style={{ fontSize: '1.5rem' }}>
            {status?.questionCount || 0}
          </p>
          <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            {status?.hasQuiz ? 'Ready' : 'Processing'}
          </p>
        </div>

        {status?.category && (
          <div style={{ 
            padding: '1rem', 
            border: '2px solid #e5e7eb', 
            borderRadius: '8px',
            backgroundColor: '#fef3c7'
          }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Category
            </h3>
            <p style={{ fontSize: '1rem', textTransform: 'capitalize' }}>
              {status.category}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {status?.status === 'completed' && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button
            onClick={goToFlashcards}
            disabled={!status.hasFlashcards}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: status.hasFlashcards ? '#3b82f6' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: status.hasFlashcards ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
            }}
          >
            📚 View Flashcards ({status.flashcardCount})
          </button>
          
          <button
            onClick={goToQuiz}
            disabled={!status.hasQuiz}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: status.hasQuiz ? '#10b981' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: status.hasQuiz ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
            }}
          >
            📝 Start Quiz ({status.questionCount} questions)
          </button>
        </div>
      )}

      {/* Processing Message */}
      {status?.status === 'processing' && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#eff6ff',
          border: '2px solid #3b82f6',
          borderRadius: '8px',
          marginBottom: '2rem',
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>
            ⏳ Still processing... This page will update automatically.
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
            Translation, flashcard generation, and quiz creation are running in the background.
          </p>
        </div>
      )}

      {/* Translation Display */}
      <div style={{ 
        border: '2px solid #e5e7eb', 
        borderRadius: '8px', 
        overflow: 'hidden' 
      }}>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#f9fafb',
          borderBottom: '2px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
            Translated Content
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Click on a language to expand/collapse the translation
          </p>
        </div>

        {languages.map(({ code, name, text }) => (
          <div 
            key={code}
            style={{ 
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <button
              onClick={() => toggleLanguage(code)}
              style={{
                width: '100%',
                padding: '1rem',
                textAlign: 'left',
                backgroundColor: expandedLanguages.has(code) ? '#f3f4f6' : 'white',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '1rem',
              }}
            >
              <span style={{ fontWeight: 'bold' }}>{name}</span>
              <span style={{ fontSize: '1.25rem' }}>
                {expandedLanguages.has(code) ? '▼' : '▶'}
              </span>
            </button>
            
            {expandedLanguages.has(code) && (
              <div style={{ 
                padding: '1.5rem',
                backgroundColor: '#f9fafb',
                maxHeight: '500px',
                overflow: 'auto'
              }}>
                <pre style={{ 
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  margin: 0,
                  fontFamily: 'inherit',
                  lineHeight: '1.6',
                }}>
                  {text}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Raw JSON (Debug) */}
      <details style={{ marginTop: '2rem' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#6b7280' }}>
          🔍 View Raw JSON (Debug)
        </summary>
        <pre style={{ 
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          overflow: 'auto',
          maxHeight: '400px',
          fontSize: '0.875rem',
        }}>
          {JSON.stringify({ translation, status }, null, 2)}
        </pre>
      </details>
    </div>
  );
}