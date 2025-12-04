import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import DocumentNav from "../../components/DocumentNav";
import DocumentSelector from "../../components/learning/DocumentSelector";
import DocumentStudyOptions from "../../components/learning/DocumentStudyOptions";
import LoadingBar from "../../components/LoadingBar";
import type { Document } from "../../types/document";
import { useDocument } from "../../hooks/useDocument";
import { useDocumentAccess } from "../../hooks/useDocumentAccess";
import { useSmartNavigation } from "../../hooks/useSmartNavigation";
import LessonOptionsDrawer from "../drawers/LessonOptionsDrawer";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function SelectStudyType() {
  const navigate = useNavigate();
  const location = useLocation();
  const { navigateBack } = useSmartNavigation();
  const { getToken } = useAuth();
  const { documentId } = useParams<{ documentId: string }>();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isFriendLesson =
    (location.state as { isFriendLesson?: boolean })?.isFriendLesson || false;

  const {
    data: documentData,
    isLoading,
    error: documentError,
  } = useDocument(documentId);
  const { isOwner } = useDocumentAccess(
    selectedDocument || documentData?.document || null
  );

  const { data: quizzesData, isLoading: isLoadingQuizzes } = useQuery({
    queryKey: ["documentQuizzes", documentId],
    queryFn: async () => {
      if (!documentId) return null;
      const token = await getToken();
      const res = await fetch(
        `${BACKEND_URL}/learning/documents/${documentId}/quizzes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) return null;
      const data = await res.json();
      console.log("📊 Quizzes data for document:", {
        documentId,
        quizzes: data.data || data.quizzes,
      });
      return data.data || data.quizzes || [];
    },
    enabled: !!documentId,
  });

  const quizData = quizzesData?.[0];

  console.log("🎯 SelectStudyType state:", {
    documentId,
    quizzesData,
    quizData,
    quizId: quizData?.id,
    hasQuizData: !!quizData,
  });

  useEffect(() => {
    if (documentData?.document && !selectedDocument) {
      setSelectedDocument(documentData.document);
    }
  }, [documentData, selectedDocument]);

  // Reset selectedDocument when documentId changes
  useEffect(() => {
    if (documentId) {
      setSelectedDocument(null);
    }
  }, [documentId]);

  const handleDocumentSelect = (document: Document) => {
    // If we're already on a document page, navigate to the new document
    // Otherwise, just update the selected document state
    if (documentId) {
      navigate(`/learning/documents/${document.id}/study`);
    } else {
      setSelectedDocument(document);
    }
  };

  const handleDemoDocs = () => {
    const document = selectedDocument || documentData?.document;
    if (document) {
      navigate(`/documents/${document.id}/translation`, {
        state: { isFriendLesson },
      });
    }
  };

  const handleBackClick = () => {
    if (documentId) {
      navigateBack("/learning/custom");
    } else if (selectedDocument) {
      setSelectedDocument(null);
    } else {
      navigateBack("/learning/custom");
    }
  };

  const handleOptionsClick = () => {
    setIsDrawerOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="fullTranslationOverview">
          <LoadingBar isLoading={true} text="Loading document" />
        </div>
      </div>
    );
  }

  if (documentError && documentId) {
    return (
      <div className="container">
        <div className="fullTranslationOverview">
          <DocumentNav
            activeTab="lesson"
            title="Access Denied"
            subtitle=""
            onBackClick={handleBackClick}
            onSubtitleClick={undefined}
          />
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <p
              style={{
                fontSize: "1.1rem",
                marginBottom: "1rem",
                color: "#666",
              }}
            >
              You don't have permission to access this lesson.
            </p>
            <p style={{ fontSize: "0.9rem", color: "#999" }}>
              This lesson is private or you haven't been granted access by the
              owner.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const shouldShowDocumentSelector = !documentId && !selectedDocument;
  const shouldShowStudyOptions =
    selectedDocument || (documentId && !isLoading && documentData?.document);

  return (
    <>
      <div className="container">
        <div className="fullTranslationOverview">
          <LessonOptionsDrawer
            open={isDrawerOpen}
            onOpenChange={setIsDrawerOpen}
            quizId={quizData?.id || null}
            documentId={
              selectedDocument?.id ||
              documentData?.document?.id ||
              documentId ||
              null
            }
            documentName={
              selectedDocument?.filename ||
              documentData?.document?.filename ||
              ""
            }
          />
          <DocumentNav
            activeTab="lesson"
            title={
              selectedDocument
                ? selectedDocument.filename
                : documentData?.document
                ? documentData.document.filename
                : "Select a Document"
            }
            subtitle={
              isOwner &&
              (selectedDocument || documentData?.document) &&
              !isLoadingQuizzes &&
              quizData
                ? "..."
                : ""
            }
            onDocumentClick={
              selectedDocument || documentData?.document
                ? handleDemoDocs
                : undefined
            }
            onBackClick={handleBackClick}
            onSubtitleClick={
              isOwner && !isLoadingQuizzes && quizData
                ? handleOptionsClick
                : undefined
            }
            lessonId={isOwner && quizData?.id ? quizData.id : undefined}
          />

          {shouldShowDocumentSelector ? (
            <div style={{ padding: "1rem" }}>
              <DocumentSelector
                onDocumentSelect={handleDocumentSelect}
                filterProcessed={true}
                emptyStateMessage="No documents available for study yet."
              />
            </div>
          ) : shouldShowStudyOptions &&
            (selectedDocument?.id ||
              documentData?.document?.id ||
              documentId) ? (
            <DocumentStudyOptions
              documentId={
                selectedDocument?.id ||
                documentData?.document?.id ||
                documentId!
              }
              terminologyColor="blue"
              quizColor="red"
              showWordOfTheDay={true}
            />
          ) : (
            <LoadingBar isLoading={true} text="Loading document" />
          )}
        </div>
      </div>
    </>
  );
}
