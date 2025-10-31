import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DocumentNav from '../../components/DocumentNav';
import DocumentSelector from '../../components/learning/DocumentSelector';
import DocumentStudyOptions from '../../components/learning/DocumentStudyOptions';
import WordOfTheDay from '../../components/WordOfTheDay';
import type { Document } from '../../types/document';
import { useDocument } from '../../hooks/useDocument';

/**
 * SelectStudyType - Allows users to select a document and choose study type
 * Can be accessed directly with a documentId in the URL or via document selection
 */
export default function SelectStudyType() {
  const navigate = useNavigate();
  const { documentId } = useParams<{ documentId: string }>();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // Fetch document from URL param using cached hook
  const { data: documentData, isLoading } = useDocument(documentId);

  // Update selected document when data is fetched
  useEffect(() => {
    if (documentData?.document && !selectedDocument) {
      setSelectedDocument(documentData.document);
    }
  }, [documentData, selectedDocument]);

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
  };

  const handleDemoDocs = () => {
    if (selectedDocument) {
      navigate(`/documents/${selectedDocument.id}/translation`);
    }
  };

  const handleBackClick = () => {
    if (documentId) {
      // If we came from a specific document, go back to documents list
      navigate('/documents');
    } else if (selectedDocument) {
      // If document is selected (from selector), go back to document selection
      setSelectedDocument(null);
    } else {
      // Otherwise go back to custom learning
      navigate('/learning/custom');
    }
  };

  /*
  ==========================================
  COMMENTED OUT FOR FUTURE USE:
  Category/Level selection logic will be implemented here
  when moved from design mockups to production
  ==========================================

  const [viewMode, setViewMode] = useState<'document' | 'category' | 'level'>('document');

  const handleCategorySelect = (category: string) => {
    navigate(`/learning/custom/categories/${category}`);
  };

  const handleLevelSelect = (levelId: number) => {
    navigate(`/learning/existing/levels/${levelId}`);
  };

  // Add UI switcher for document/category/level views
  <div className="view-mode-selector">
    <button onClick={() => setViewMode('document')}>By Document</button>
    <button onClick={() => setViewMode('category')}>By Category</button>
    <button onClick={() => setViewMode('level')}>By Level</button>
  </div>

  ==========================================
  */

  if (isLoading) {
    return (
      <div className="fullTranslationOverview">
        <div className="loading-container">
          <h2 className="loading-title">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="fullTranslationOverview">
      <div className="container demo">
        <DocumentNav
          activeTab="lesson"
          title={selectedDocument ? selectedDocument.filename : "Select a Document"}
          onDocumentClick={selectedDocument ? handleDemoDocs : undefined}
          onBackClick={handleBackClick}
        />

        {selectedDocument && (
          <WordOfTheDay hideTitle={true} />
        )}

        {!selectedDocument ? (
          <div style={{ padding: '1rem' }}>
            <DocumentSelector
              onDocumentSelect={handleDocumentSelect}
              filterProcessed={true}
              emptyStateMessage="No documents available for study yet."
            />
          </div>
        ) : (
          <DocumentStudyOptions
            documentId={selectedDocument.id}
            terminologyColor="blue"
            quizColor="red"
          />
        )}
      </div>
    </div>
  );
}
