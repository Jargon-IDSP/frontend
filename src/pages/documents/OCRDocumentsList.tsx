import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { BACKEND_URL } from '../../lib/api';
import OCRResultsModal from './OCRResultsModal';

export default function OCRDocumentsList() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const { getToken } = useAuth();

  const fetchDocuments = async () => {
    try {
      setLoading(true);
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

  useEffect(() => {
    fetchDocuments();
  }, []);

  const ocrProcessedDocs = documents.filter((doc) => doc.ocrProcessed);

  if (loading) {
    return <div style={{ padding: '1rem' }}>Loading documents...</div>;
  }

  if (ocrProcessedDocs.length === 0) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
      }}>
        <p style={{ color: '#6b7280', margin: 0 }}>
          No OCR processed documents yet. Upload and process a document to see results here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>
        📚 OCR Processed Documents ({ocrProcessedDocs.length})
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {ocrProcessedDocs.map((doc) => (
          <div
            key={doc.id}
            style={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937', fontSize: '1.125rem' }}>
                📄 {doc.filename}
              </h3>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#6b7280' }}>Type: {doc.fileType || 'Unknown'}</span>
                <span style={{ color: '#6b7280' }}>
                  Size: {Math.round((doc.fileSize || 0) / 1024)} KB
                </span>
                <span style={{
                  color: '#10b981',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}>
                  ✓ OCR Processed
                </span>
              </div>
              {doc.extractedText && (
                <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
                  Preview: {doc.extractedText.substring(0, 100)}
                  {doc.extractedText.length > 100 ? '...' : ''}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedDoc(doc)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                marginLeft: '1rem',
              }}
            >
              View Contents
            </button>
          </div>
        ))}
      </div>

      {selectedDoc && (
        <OCRResultsModal document={selectedDoc} onClose={() => setSelectedDoc(null)} />
      )}
    </div>
  );
}