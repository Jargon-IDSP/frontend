// components/DocumentsList.tsx
import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'

interface DocumentsListProps {
  refresh?: number 
}

export function DocumentsList({ refresh }: DocumentsListProps) {
  const [documents, setDocuments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const { getToken } = useAuth()  // ← ADD THIS

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080"

  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoading(true)
      setError('')
      
      try {
        const token = await getToken()  
        
        const response = await fetch(`${BACKEND_URL}/documents`, {
          headers: {
            'Authorization': `Bearer ${token}` 
          },
          credentials: 'include',
        })
        
        if (!response.ok) throw new Error('Failed to fetch documents')
        
        const data = await response.json()
        setDocuments(data.documents || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load documents')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocuments()
  }, [refresh]) 

  const handleDownload = async (docId: string) => {
    try {
      const token = await getToken() 
      
      const response = await fetch(`${BACKEND_URL}/documents/${docId}/download`, {
        headers: {
          'Authorization': `Bearer ${token}` 
        },
        credentials: 'include',
      })
      
      if (!response.ok) throw new Error('Failed to get download URL')
      
      const { downloadUrl } = await response.json()
      
      window.open(downloadUrl, '_blank')
    } catch (err) {
      console.error('Download error:', err)
      alert('Failed to download file')
    }
  }

  if (isLoading) return <p style={{ padding: '1.5rem', color: '#666' }}>Loading documents…</p>
  if (error) return <p style={{ padding: '1.5rem', color: 'red' }}>{error}</p>

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem' }}>
      <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        Uploaded Documents
      </h3>
      
      {documents.length > 0 ? (
        <div>
          {documents.map((doc) => (
            <div 
              key={doc.id} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '0.75rem',
                border: '1px solid #e5e5e5',
                borderRadius: '4px',
                marginBottom: '0.5rem'
              }}
            >
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>{doc.filename}</p>
                <p style={{ fontSize: '0.75rem', color: '#666' }}>
                  Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDownload(doc.id)}
                style={{ 
                  background: 'none',
                  border: 'none',
                  color: '#0066cc', 
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}
              >
                📄 Download
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: '0.875rem', color: '#666' }}>
          No documents uploaded yet.
        </p>
      )}
    </div>
  )
}