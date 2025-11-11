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

  const { data: documentData, isLoading, error: documentError } = useDocument(documentId);
  const { isOwner } = useDocumentAccess(selectedDocument);

  // Fetch quizzes for the document
  const { data: quizzesData, isLoading: isLoadingQuizzes } = useQuery({
    queryKey: ["documentQuizzes", documentId],
    queryFn: async () => {
      if (!documentId) return null;
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/learning/documents/${documentId}/quizzes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      const data = await res.json();
      console.log('📊 Quizzes data for document:', { documentId, quizzes: data.data || data.quizzes });
      return data.data || data.quizzes || [];
    },
    enabled: !!documentId,
  });

  const quizData = quizzesData?.[0]; // Get the first quiz

  console.log('🎯 SelectStudyType state:', {
    documentId,
    quizzesData,
    quizData,
    quizId: quizData?.id,
    hasQuizData: !!quizData
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

  // Show error if user doesn't have access to the document
  if (documentError && documentId) {
    return (
      <div className="fullTranslationOverview">
        <div className="container demo">
          <DocumentNav
            activeTab="lesson"
            title="Access Denied"
            subtitle=""
            onBackClick={handleBackClick}
            onSubtitleClick={undefined}
          />
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <p style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "#666" }}>
              You don't have permission to access this lesson.
            </p>
            <p style={{ fontSize: "0.9rem", color: "#999" }}>
              This lesson is private or you haven't been granted access by the owner.
            </p>
          </div>
        </div>
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
            subtitle={isOwner && (selectedDocument || documentData?.document) && !isLoadingQuizzes && quizData ? "..." : ""}
            onDocumentClick={(selectedDocument || documentData?.document) ? handleDemoDocs : undefined}
            onBackClick={handleBackClick}
            onSubtitleClick={isOwner && !isLoadingQuizzes && quizData ? handleOptionsClick : undefined}
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
