import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DocumentNav from '../../components/DocumentNav';
import DocumentSelector from '../../components/learning/DocumentSelector';
import DocumentStudyOptions from '../../components/learning/DocumentStudyOptions';
import demoTermCard from '../../assets/demoTermCard.png';
import type { Document } from '../../types/document';

/**
 * SelectStudyType - Allows users to select a document and choose study type
 * Replaces the hardcoded DemoTakeQuiz with dynamic document selection
 */
export default function SelectStudyType() {
  const navigate = useNavigate();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
  };

  const handleDemoDocs = () => {
    if (selectedDocument) {
      navigate(`/documents/${selectedDocument.id}/translation`);
    }
  };

  const handleBackClick = () => {
    if (selectedDocument) {
      // If document is selected, go back to document selection
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

  return (
    <div className="fullTranslationOverview">
      <div className="container demo">
        <DocumentNav
        activeTab="lesson"
        title={selectedDocument ? selectedDocument.filename : "Select a Document"}
        subtitle={selectedDocument ? "Study Options" : "Choose what to study"}
        onDocumentClick={selectedDocument ? handleDemoDocs : undefined}
        onBackClick={handleBackClick}
      />

      {selectedDocument && (
        <img className="demo-term-card" src={demoTermCard} alt="Demo Term Card" />
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
