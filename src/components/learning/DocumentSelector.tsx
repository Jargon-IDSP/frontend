import { useDocuments } from '../../hooks/useDocuments';
import { NavigationCard } from './ui/Card';
import type { DocumentSelectorProps } from '../../types/documentSelector';
import '../../styles/components/_documentSelector.scss';

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
      <div className="document-selector__loading">
        <p className="document-selector__loading-text">Loading documents...</p>
        <div className="document-selector__loading-bar-container">
          <div className="document-selector__loading-bar-fill" />
        </div>
      </div>
    );
  }

  if (displayDocuments.length === 0) {
    return (
      <div className="document-selector__empty-state">
        <p className="document-selector__empty-state-title">
          {emptyStateMessage}
        </p>
        <p className="document-selector__empty-state-subtitle">
          Upload and process documents to study from them.
        </p>
      </div>
    );
  }

  return (
    <div className="document-selector__list">
      <h3 className="document-selector__title">
        Select a Document
      </h3>
      {displayDocuments.map((doc) => (
        <NavigationCard
          key={doc.id}
          title={doc.filename}
          description={doc.ocrProcessed ? 'Ready to study' : 'Processing...'}
          onClick={() => onDocumentSelect(doc)}
        />
      ))}
    </div>
  );
}
