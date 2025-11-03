import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DocumentNav from '../../components/DocumentNav';
import DocumentSelector from '../../components/learning/DocumentSelector';
import DocumentStudyOptions from '../../components/learning/DocumentStudyOptions';
import WordOfTheDay from '../../components/WordOfTheDay';
import type { Document } from '../../types/document';
import { useDocument } from '../../hooks/useDocument';


export default function SelectStudyType() {
  const navigate = useNavigate();
  const { documentId } = useParams<{ documentId: string }>();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const { data: documentData, isLoading } = useDocument(documentId);

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
      navigate(-1);
    } else if (selectedDocument) {
      setSelectedDocument(null);
    } else {
      navigate('/learning/custom');
    }
  };


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

        {selectedDocument && <WordOfTheDay />}

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
