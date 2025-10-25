import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { BACKEND_URL } from '../../lib/api';
import type { Translation } from '../../types/document';
import { useUserPreferences } from '../../hooks/useUserPreferences';

export default function DocumentTranslationView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { language: userLanguage } = useUserPreferences();
  
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchData();
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [id]);

  const fetchData = async () => {
    try {
      const token = await getToken();
      
      const translationRes = await fetch(`${BACKEND_URL}/documents/${id}/translation`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (translationRes.ok) {
        const data = await translationRes.json();
        
        if (data.processing) {
          if (!pollIntervalRef.current) {
            setProcessing(true);
            setLoading(false);
            startPolling();
          }
        } else {
          setTranslation(data.translation);
          setProcessing(false);
          setLoading(false);
          
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
        }
      } else {
        const errorData = await translationRes.json();
        setError(errorData.error || 'Translation not found');
        setLoading(false);
        setProcessing(false);
        
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load document data');
      setLoading(false);
      setProcessing(false);
      
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }
  };

  const startPolling = () => {
    if (!pollIntervalRef.current) {
      pollIntervalRef.current = setInterval(() => {
        fetchData();
      }, 3000);
    }
  };

  const getTranslatedText = () => {
    if (!translation) return '';
    
    const languageKey = `text${userLanguage.charAt(0).toUpperCase() + userLanguage.slice(1)}` as keyof Translation;
    return translation[languageKey] as string || translation.textEnglish;
  };

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Loading...</h2>
      </div>
    );
  }

  if (processing) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Loading...</h2>
        <p style={{ color: '#666', marginBottom: '0.5rem' }}>
          Your document is being translated.
        </p>
        <p style={{ color: '#666', marginBottom: '1rem', fontSize: '0.9rem' }}>
          Feel free to navigate away - translation will continue in the background and flashcards/quizzes will be generated automatically.
        </p>
        <div style={{ 
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }} />
        <div>
          <button onClick={() => navigate('/documents')} style={{ marginRight: '0.5rem' }}>
            ← Back to Documents
          </button>
          <button onClick={() => navigate('/learning/custom')}>
            Go to Learning Hub
          </button>
        </div>
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
        <p>{error || 'Translation not found.'}</p>
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

  const languageNames: Record<string, string> = {
    english: 'English',
    french: 'French',
    chinese: 'Chinese',
    spanish: 'Spanish',
    tagalog: 'Tagalog',
    punjabi: 'Punjabi',
    korean: 'Korean',
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/documents')}>
            ← Back to Documents
          </button>
          <button onClick={() => navigate('/learning/custom')}>
            Study All Custom Content
          </button>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>
          {translation.document.filename}
        </h1>
        <p style={{ color: '#6b7280' }}>
          Uploaded on {new Date(translation.document.createdAt).toLocaleDateString()}
        </p>
        
        <div style={{ marginTop: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Study from this document:</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => navigate(`/documents/${id}/study`)}>
              📖 View All Study Materials
            </button>
          </div>
        </div>
      </div>

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
            {languageNames[userLanguage] || 'English'} Translation
          </h2>
        </div>

        <div style={{ 
          padding: '1.5rem',
          backgroundColor: 'white'
        }}>
          <pre style={{ 
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            margin: 0,
            fontFamily: 'inherit',
            lineHeight: '1.6',
            fontSize: '1rem',
          }}>
            {getTranslatedText()}
          </pre>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
