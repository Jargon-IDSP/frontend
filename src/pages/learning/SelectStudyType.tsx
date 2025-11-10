import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import DocumentNav from "../../components/DocumentNav";
import DocumentSelector from "../../components/learning/DocumentSelector";
import DocumentStudyOptions from "../../components/learning/DocumentStudyOptions";
import WordOfTheDay from "../../components/WordOfTheDay";
import LoadingBar from "../../components/LoadingBar";
import type { Document } from "../../types/document";
import { useDocument } from "../../hooks/useDocument";
import { useDocumentAccess } from "../../hooks/useDocumentAccess";
import LessonOptionsDrawer from "../drawers/LessonOptionsDrawer";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function SelectStudyType() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getToken } = useAuth();
  const { documentId } = useParams<{ documentId: string }>();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Add drawer state

  // Check if this is a friend's lesson from location state
  const isFriendLesson = (location.state as { isFriendLesson?: boolean })?.isFriendLesson || false;

  const { data: documentData, isLoading } = useDocument(documentId);
  const { isOwner } = useDocumentAccess(selectedDocument);

  // Fetch quiz ID for the document
  const { data: quizData } = useQuery({
    queryKey: ["documentQuiz", documentId],
    queryFn: async () => {
      if (!documentId) return null;
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/learning/documents/${documentId}/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.data;
    },
    enabled: !!documentId,
  });

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
      navigate(`/documents/${selectedDocument.id}/translation`, {
        state: { isFriendLesson },
      });
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
    setIsDrawerOpen(true); // Open drawer when three dots clicked (only for own lessons)
  };

  if (isLoading) {
    return (
      <div className="fullTranslationOverview">
        <LoadingBar isLoading={true} text="Loading document" />
      </div>
    );
  }

  // If we have a documentId in the URL (from friend's lesson), don't show DocumentSelector
  // Wait for the document to load or show error
  const shouldShowDocumentSelector = !documentId && !selectedDocument;
  const shouldShowStudyOptions = selectedDocument || (documentId && !isLoading && documentData?.document);

  return (
    <>
      <LessonOptionsDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        quizId={quizData?.id || null}
        documentId={selectedDocument?.id || documentData?.document?.id || documentId || null}
        documentName={selectedDocument?.filename || documentData?.document?.filename || ""}
      />

      <div className="fullTranslationOverview">
        <div className="container demo">
          <DocumentNav
            activeTab="lesson"
            title={
              selectedDocument ? selectedDocument.filename :
              (documentData?.document ? documentData.document.filename : "Select a Document")
            }
            subtitle={isOwner && (selectedDocument || documentData?.document) ? "..." : ""}
            onDocumentClick={(selectedDocument || documentData?.document) ? handleDemoDocs : undefined}
            onBackClick={handleBackClick}
            onSubtitleClick={isOwner ? handleOptionsClick : undefined}
          />

          {(selectedDocument || documentData?.document) && <WordOfTheDay />}

          {shouldShowDocumentSelector ? (
            <div style={{ padding: "1rem" }}>
              <DocumentSelector
                onDocumentSelect={handleDocumentSelect}
                filterProcessed={true}
                emptyStateMessage="No documents available for study yet."
              />
            </div>
          ) : shouldShowStudyOptions && (selectedDocument?.id || documentData?.document?.id || documentId) ? (
            <DocumentStudyOptions
              documentId={selectedDocument?.id || documentData?.document?.id || documentId!}
              terminologyColor="blue"
              quizColor="red"
            />
          ) : (
            <LoadingBar isLoading={true} text="Loading document" />
          )}
        </div>
      </div>
    </>
  );
}
