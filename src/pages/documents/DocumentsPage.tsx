import { useState, useEffect } from 'react'
import { DocumentsList } from './DocumentList'
import RockySpeechBubble from '../../components/RockySpeechBubble'
import { SimpleFileUpload } from '../../components/SimpleFileUpload'
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '@clerk/clerk-react';
import { BACKEND_URL } from '../../lib/api';

export default function DocumentsPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const [showPrebuiltLink, setShowPrebuiltLink] = useState(false)
  const [processingDocId, setProcessingDocId] = useState<string | null>(null)
  const [processingComplete, setProcessingComplete] = useState(false)
  const navigate = useNavigate();
  const location = useLocation();
  const { getToken } = useAuth();

  // Poll document status when we have a processing document
  useEffect(() => {
    if (!processingDocId) return;

    const checkDocumentStatus = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${BACKEND_URL}/documents/${processingDocId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const { document } = await res.json();
          
          // Check if processing is complete
          if (document.ocrProcessed) {
            setProcessingComplete(true);
            setSuccessMessage('🎉 Your document is ready! Flashcards and questions have been generated.');
            setShowPrebuiltLink(false);
            setProcessingDocId(null);
            setRefreshKey(prev => prev + 1);
            
            // Clear completion message after 8 seconds
            setTimeout(() => {
              setSuccessMessage('');
              setProcessingComplete(false);
            }, 8000);
          }
        }
      } catch (err) {
        console.error('Error checking document status:', err);
      }
    };

    // Poll every 3 seconds
    const interval = setInterval(checkDocumentStatus, 3000);
    
    // Also check immediately
    checkDocumentStatus();

    return () => clearInterval(interval);
  }, [processingDocId, getToken]);

  useEffect(() => {
    // Check if we have a success message from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setShowPrebuiltLink(location.state?.showPrebuiltLink || false);
      
      // If we have a documentId, start polling for completion
      if (location.state?.documentId) {
        setProcessingDocId(location.state.documentId);
        setRefreshKey(prev => prev + 1);
      }
      
      // Clear the initial message after 10 seconds (longer since they might want to click the link)
      const timer = setTimeout(() => {
        if (!processingComplete) {
          setSuccessMessage('');
          setShowPrebuiltLink(false);
        }
      }, 10000);
      
      // Clear navigation state to prevent message from showing again on refresh
      navigate(location.pathname, { replace: true, state: {} });
      
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate, location.pathname, processingComplete]);

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="container">
      
      <button 
        onClick={() => navigate("/")}
        className="back-button"
      >
        ← Back to Dashboard
      </button>
      
      <h1 className="page-title">
        AI Translate & Lesson
      </h1>

      <RockySpeechBubble
        text="Upload your documents and I'll turn them into bite-sized lessons!"
        className="documents-speech-bubble"
      />

      {successMessage && (
        <div className="success-message">
          <p className="success-text">
            {successMessage}
            {showPrebuiltLink && (
              <>
                {' '}
                <button 
                  onClick={() => navigate('/learning')}
                  className="inline-link-button"
                  style={{
                    color: '#3b82f6',
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 'inherit',
                    padding: 0,
                    fontWeight: '600'
                  }}
                >
                  Click here
                </button>
              </>
            )}
            {processingComplete && processingDocId && (
              <>
                {' '}
                <button 
                  onClick={() => navigate(`/documents/${processingDocId}/translation`)}
                  style={{
                    marginLeft: '10px',
                    padding: '8px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  View Translation
                </button>
              </>
            )}
          </p>
        </div>
      )}

      <div className="upload-section">
        <SimpleFileUpload onSuccess={handleUploadSuccess} />
      </div>

      <DocumentsList refresh={refreshKey} />
    </div>
  )
}