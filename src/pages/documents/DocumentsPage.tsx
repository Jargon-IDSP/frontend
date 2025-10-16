import { useState } from 'react'
import { UploadDocumentForm } from '../../components/UploadDocumentForm'
import { DocumentsList } from '../../components/DocumentList'
import { useNavigate } from "react-router-dom";

export default function DocumentsPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const navigate = useNavigate();

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div style={{ maxWidth: '48rem', margin: '0 auto', padding: '1.5rem' }}>
      
      <button 
        onClick={() => navigate("/")}
        style={{ marginBottom: "1rem" }}
      >
        ← Back to Dashboard
      </button>
      
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>
        My Documents
      </h1>

      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Upload New Document
        </h2>
        <UploadDocumentForm onSuccess={handleUploadSuccess} />
      </div>

      <DocumentsList refresh={refreshKey} />
    </div>
  )
}