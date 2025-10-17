import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { BACKEND_URL } from '../../lib/api';

interface OCRModalProps {
  document: any;
  onClose: () => void;
}

export default function OCRResultsModal({ document, onClose }: OCRModalProps) {
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'formatted' | 'json'>('json');
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const token = await getToken();
        const res = await fetch(
          `${BACKEND_URL}/custom-flashcards?documentId=${document.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setFlashcards(data.flashcards || []);
        }
      } catch (err) {
        console.error('Error fetching flashcards:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [document.id, getToken]);

  const jsonData = {
    document: {
      id: document.id,
      filename: document.filename,
      fileType: document.fileType,
      fileSize: document.fileSize,
      ocrProcessed: document.ocrProcessed,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    },
    extractedText: document.extractedText,
    textLength: document.extractedText?.length || 0,
    flashcards: flashcards,
    flashcardsCount: flashcards.length,
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
    alert('JSON copied to clipboard!');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '2rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '2rem',
          maxWidth: '900px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '1rem',
        }}>
          <h2 style={{ margin: 0, color: '#1f2937' }}>📄 {document.filename}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => setViewMode('formatted')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: viewMode === 'formatted' ? '#3b82f6' : '#e5e7eb',
              color: viewMode === 'formatted' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Formatted View
          </button>
          <button
            onClick={() => setViewMode('json')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: viewMode === 'json' ? '#3b82f6' : '#e5e7eb',
              color: viewMode === 'json' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            JSON View
          </button>
          {viewMode === 'json' && (
            <button
              onClick={copyToClipboard}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                marginLeft: 'auto',
              }}
            >
              📋 Copy JSON
            </button>
          )}
        </div>

        {viewMode === 'json' ? (
          <pre style={{
            backgroundColor: '#1f2937',
            color: '#f9fafb',
            padding: '1.5rem',
            borderRadius: '6px',
            overflow: 'auto',
            maxHeight: '60vh',
            fontSize: '0.875rem',
            fontFamily: 'monospace',
            margin: 0,
          }}>
            {JSON.stringify(jsonData, null, 2)}
          </pre>
        ) : (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>📝 Extracted Text</h3>
              <div style={{
                backgroundColor: '#f9fafb',
                padding: '1rem',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                maxHeight: '200px',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              }}>
                {document.extractedText || 'No text extracted'}
              </div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                Length: {document.extractedText?.length || 0} characters
              </p>
            </div>

            <div>
              <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>
                🎴 Flashcards Created ({flashcards.length})
              </h3>
              {loading ? (
                <p style={{ color: '#6b7280' }}>Loading flashcards...</p>
              ) : flashcards.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {flashcards.map((card, index) => (
                    <div
                      key={card.id || index}
                      style={{
                        backgroundColor: '#f9fafb',
                        padding: '1rem',
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong style={{ color: '#1f2937' }}>Term:</strong>
                        <p style={{ margin: '0.25rem 0 0 0', color: '#374151' }}>
                          {card.termEnglish}
                        </p>
                      </div>
                      <div>
                        <strong style={{ color: '#1f2937' }}>Definition:</strong>
                        <p style={{ margin: '0.25rem 0 0 0', color: '#374151' }}>
                          {card.definitionEnglish}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#6b7280' }}>
                  No flashcards created from this document yet.
                </p>
              )}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: '1.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            width: '100%',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}