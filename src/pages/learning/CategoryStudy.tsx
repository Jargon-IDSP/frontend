import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useDocumentsByCategory } from "../../hooks/useDocumentsByCategory";
import { useDocumentProcessingStatus } from "../../hooks/useDocumentProcessingStatus";
import { useQueryClient } from "@tanstack/react-query";
import { ProcessingDocumentCard } from "../../components/learning/ProcessingDocumentCard";
import LoadingBar from "../../components/LoadingBar";
import goBackIcon from "../../assets/icons/goBackIcon.svg";


const categoryNames: Record<string, string> = {
  safety: "Safety",
  technical: "Technical",
  training: "Training",
  workplace: "Workplace",
  professional: "Professional",
  general: "General",
};

export default function CategoryStudy() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { category } = useParams<{ category: string }>();

  const categoryName = category
    ? categoryNames[category.toLowerCase()] || category
    : "Category";

  const {
    data: documents = [],
    isLoading,
    refetch,
  } = useDocumentsByCategory(category || "general");

  const justUploadedDocId = location.state?.documentId;
  const justUploaded = location.state?.justUploaded;
  const initialStatusData = location.state?.initialStatusData;

  const { data: statusData } = useDocumentProcessingStatus({
    documentId: justUploaded ? justUploadedDocId : null,
    pollingInterval: 1000,
  });

  const displayStatusData = statusData || initialStatusData;

  const isWaitingForStatusData = justUploaded && !displayStatusData;

  useEffect(() => {
    if (statusData?.status.status === "completed" && justUploadedDocId) {
      refetch();
      queryClient.invalidateQueries({
        queryKey: ["documents", "by-category", category],
      });

      setTimeout(() => {
        navigate(`/learning/documents/${justUploadedDocId}/study`);
      }, 1000);
    }
  }, [statusData?.status.status, refetch, queryClient, category, justUploadedDocId, navigate]);

  return (
    <div className="container">
    <div className="category-study">
      <div className="category-study__header">
        <img
          src={goBackIcon}
          alt="Go back"
          className="category-study__back-icon"
          onClick={() => navigate(justUploaded ? '/documents' : '/learning/custom/categories')}
        />
        <h1 className="category-study__header-title">
          {categoryName} Category
        </h1>
      </div>

      {isWaitingForStatusData && (
        <LoadingBar isLoading={true} text="Loading document status" />
      )}

      {justUploaded && displayStatusData && (
        <ProcessingDocumentCard
          filename={displayStatusData.document.filename}
          status={displayStatusData.status}
          documentId={displayStatusData.document.id}
        />
      )}

      {!isWaitingForStatusData && (
        <>
          {isLoading ? (
            <div className="category-study__loading">Loading documents...</div>
          ) : documents.length === 0 && !justUploaded ? (
            <div className="category-study__empty-state">
              <p>No documents in the {categoryName} category yet.</p>
              <p className="category-study__empty-state-description">
                Upload and process documents to see them here!
              </p>
            </div>
          ) : (
            <div className="category-study__documents-list">
              {documents.map((doc) => {
                if (
                  justUploaded &&
                  doc.id === justUploadedDocId &&
                  displayStatusData?.status.status === "processing"
                ) {
                  return null;
                }

                const isProcessing =
                  !doc.ocrProcessed ||
                  doc.flashcardCount === 0 ||
                  doc.questionCount === 0;

                return (
                  <div
                    key={doc.id}
                    onClick={() => {
                      if (!isProcessing) {
                        navigate(`/learning/documents/${doc.id}/study`);
                      }
                    }}
                    className={`document-card ${
                      isProcessing ? "document-card--processing" : ""
                    }`}
                  >
                    <div className="document-card__content">
                      <div className="document-card__details">
                        <h3 className="document-card__title">{doc.filename}</h3>
                        {isProcessing ? (
                          <p className="document-card__status document-card__status--processing">
                            Processing document...
                          </p>
                        ) : (
                          <p className="document-card__status document-card__status--ready">
                            {doc.flashcardCount} flashcards • {doc.questionCount}{" "}
                            questions
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
    </div>
  );
}
