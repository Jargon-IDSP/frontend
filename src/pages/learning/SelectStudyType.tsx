import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DocumentNav from "../../components/DocumentNav";
import DocumentSelector from "../../components/learning/DocumentSelector";
import DocumentStudyOptions from "../../components/learning/DocumentStudyOptions";
import WordOfTheDay from "../../components/WordOfTheDay";
import type { Document } from "../../types/document";
import { useDocument } from "../../hooks/useDocument";
import { useDocumentAccess } from "../../hooks/useDocumentAccess";
import LessonOptionsDrawer from "../drawers/LessonOptionsDrawer";

export default function SelectStudyType() {
  const navigate = useNavigate();
  const { documentId } = useParams<{ documentId: string }>();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Add drawer state

  const { data: documentData, isLoading } = useDocument(documentId);
  const { isOwner } = useDocumentAccess(selectedDocument);

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
      navigate("/learning/custom");
    }
  };

  const handleOptionsClick = () => {
    setIsDrawerOpen(true); // Open drawer when three dots clicked
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
    <>
      <LessonOptionsDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />

      <div className="fullTranslationOverview">
        <div className="container demo">
          <DocumentNav
            activeTab="lesson"
            title={
              selectedDocument ? selectedDocument.filename : "Select a Document"
            }
            subtitle={isOwner && selectedDocument ? "..." : ""}
            onDocumentClick={selectedDocument ? handleDemoDocs : undefined}
            onBackClick={handleBackClick}
            onSubtitleClick={handleOptionsClick}
          />

          {selectedDocument && <WordOfTheDay navigateTo={`/learning/documents/${selectedDocument.id}/terms`} />}

          {!selectedDocument ? (
            <div style={{ padding: "1rem" }}>
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
    </>
  );
}
