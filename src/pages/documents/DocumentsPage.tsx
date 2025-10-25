import { useState } from 'react'
import { UploadDocumentForm } from '../../components/UploadDocumentForm'
<<<<<<< HEAD
import { DocumentsList } from './DocumentList'
=======
import { DocumentsList } from '../../components/DocumentList'
import OCRDocumentsList from './OCRDocumentsList'
import RockySpeechBubble from '../../components/RockySpeechBubble'
>>>>>>> 61ac020882fd2954fd24cf99918ad85f628c3f5a
import { useNavigate } from "react-router-dom";

export default function DocumentsPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const navigate = useNavigate();

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
<<<<<<< HEAD
        My Documents
      </h1>

=======
        AI Translate & Lesson
      </h1>

      <RockySpeechBubble 
        text="Hey there! Just upload your manuals — I'll turn them into bite-sized lessons and flashcards for you to practice anytime!"
        className="documents-speech-bubble"
      />

>>>>>>> 61ac020882fd2954fd24cf99918ad85f628c3f5a
      <div className="upload-section">
        <h2 className="section-title">
          Upload New Document
        </h2>
        <UploadDocumentForm onSuccess={handleUploadSuccess} />
      </div>

      <div className="ocr-section">
        <h2 className="section-title">
          OCR Processed Documents
        </h2>
        <OCRDocumentsList />
      </div>

      <div className="documents-section">
        <h2 className="section-title">
          All Documents
        </h2>
        <DocumentsList refresh={refreshKey} />
      </div>
    </div>
  )
}