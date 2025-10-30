import { useDocuments } from '../../hooks/useDocuments';
import { NavigationCard } from './ui/Card';
import type { Document } from '../../types/document';

interface DocumentSelectorProps {
  onDocumentSelect: (document: Document) => void;
  filterProcessed?: boolean;
  emptyStateMessage?: string;
}

/**
 * DocumentSelector - Reusable component for selecting a document
 * Fetches and displays all user documents with optional filtering
 *
 * @param onDocumentSelect - Callback when a document is selected
 * @param filterProcessed - If true, only shows OCR processed documents (default: true)
 * @param emptyStateMessage - Custom message when no documents are available
 */
export default function DocumentSelector({
  onDocumentSelect,
  filterProcessed = true,
  emptyStateMessage = 'No processed documents available yet.'
}: DocumentSelectorProps) {
  const { data: documents = [], isLoading } = useDocuments();

  const displayDocuments = filterProcessed
    ? documents.filter((doc) => doc.ocrProcessed)
    : documents;

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#6b7280' }}>Loading documents...</p>
        <div
          style={{
            width: '100%',
            height: '4px',
            backgroundColor: '#e5e7eb',
            borderRadius: '9999px',
            overflow: 'hidden',
            marginTop: '1rem',
          }}
        >
          <div
            style={{
              height: '100%',
              width: '60%',
              backgroundColor: '#fe4d13',
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
        </div>
      </div>
    );
  }

  if (displayDocuments.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          color: '#6b7280',
        }}
      >
        <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
          {emptyStateMessage}
        </p>
        <p style={{ fontSize: '0.875rem' }}>
          Upload and process documents to study from them.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}
    >
      <h3 style={{ marginBottom: '0.5rem', color: '#1f2937' }}>
        Select a Document
      </h3>
      {displayDocuments.map((doc) => (
        <NavigationCard
          key={doc.id}
          icon="📄"
          title={doc.filename}
          description={doc.ocrProcessed ? 'Ready to study' : 'Processing...'}
          onClick={() => onDocumentSelect(doc)}
        />
      ))}
    </div>
  );
}
