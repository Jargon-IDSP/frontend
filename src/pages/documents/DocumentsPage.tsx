import { useState } from 'react'
import { UploadDocumentForm } from '../../components/UploadDocumentForm'
import { DocumentsList } from './DocumentList'
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
        My Documents
      </h1>

      <div className="upload-section">
        <h2 className="section-title">
          Upload New Document
        </h2>
        <UploadDocumentForm onSuccess={handleUploadSuccess} />
      </div>

      <DocumentsList refresh={refreshKey} />
    </div>
  )
}