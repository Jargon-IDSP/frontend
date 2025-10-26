import { useState, useEffect } from 'react'
import { DocumentsList } from './DocumentList'
import RockySpeechBubble from '../../components/RockySpeechBubble'
import { SimpleFileUpload } from '../../components/SimpleFileUpload'
import { useNavigate, useLocation } from "react-router-dom";

export default function DocumentsPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [successMessage, setSuccessMessage] = useState<string>('')
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we have a success message from navigation state
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      
      // If we have a documentId, refresh the documents list
      if (location.state?.documentId) {
        setRefreshKey(prev => prev + 1);
      }
      
      // Clear the message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
      // Clear navigation state to prevent message from showing again on refresh
      navigate(location.pathname, { replace: true, state: {} });
      
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate, location.pathname]);

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
          <p className="success-text">{successMessage}</p>
        </div>
      )}

      <div className="upload-section">
        <SimpleFileUpload onSuccess={handleUploadSuccess} />
      </div>

      <DocumentsList refresh={refreshKey} />
    </div>
  )
}