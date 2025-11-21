import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useQueryClient } from "@tanstack/react-query";
import { useDocuments } from "../../hooks/useDocuments";
import { useDocumentProcessingStatus } from "../../hooks/useDocumentProcessingStatus";
import ShareDrawer from "../drawers/ShareDrawer";
import { BACKEND_URL } from "../../lib/api";
import type { Document, DocumentsListProps } from "../../types/document";
import "../../styles/components/_documentList.scss";
import fileIconB from "../../assets/icons/fileIconB.svg";
import shareIcon from "../../assets/icons/shareIcon.svg";
import editIcon from "../../assets/icons/editIcon.svg";

export function DocumentsList({ refresh }: DocumentsListProps) {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  const {
    data: documents = [],
    isLoading: loading,
    error,
  } = useDocuments(refresh);

  // Deduplicate documents by ID (in case cache returns duplicates)
  const uniqueDocuments = Array.from(
    new Map(documents.map((doc) => [doc.id, doc])).values()
  );

  const processingDocuments = uniqueDocuments.filter(
    (doc) => !doc.ocrProcessed
  );
  const processingDocId = processingDocuments.length > 0 ? processingDocuments[0].id : null;

  const { data: processingStatus } = useDocumentProcessingStatus({
    documentId: processingDocId,
  });

  useEffect(() => {
    if (processingStatus?.status.status === 'completed') {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    }
  }, [processingStatus?.status.status, queryClient]);

  const handleShare = async (e: React.MouseEvent, documentId: string) => {
    e.stopPropagation();
    try {
      const token = await getToken();
      if (!token) {
        alert("Authentication required");
        return;
      }

      const response = await fetch(
        `${BACKEND_URL}/learning/documents/${documentId}/quizzes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const quizzes = data.data || data.quizzes || [];
        if (quizzes.length > 0) {
          setSelectedQuizId(quizzes[0].id);
          setIsShareDrawerOpen(true);
        } else {
          alert("No quizzes available for this document yet.");
        }
      } else {
        alert("Failed to fetch quizzes for this document.");
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      alert("An error occurred while trying to share.");
    }
  };

  const handleDocumentClick = (doc: Document) => {
    if (doc.ocrProcessed) {
      navigate(`/learning/documents/${doc.id}/study`);
    }
  };

  const handleEditClick = async (e: React.MouseEvent, doc: Document) => {
    e.stopPropagation();
    try {
      const token = await getToken();
      if (!token) {
        alert("Authentication required");
        return;
      }

      const response = await fetch(
        `${BACKEND_URL}/learning/documents/${doc.id}/quizzes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch lessons for this document");
      }

      const data = await response.json();
      const quizzes = data.data || data.quizzes || [];

      if (quizzes.length === 0) {
        alert("No lessons found for this document yet.");
        return;
      }

      const lesson = quizzes[0];
      navigate(`/profile/lessons/${lesson.id}/edit`, {
        state: {
          lessonName: lesson.name || doc.filename,
          from: "/profile",
        },
      });
    } catch (error) {
      console.error("Failed to open lesson editor:", error);
      alert("Unable to edit this lesson right now. Please try again.");
    }
  };

  const getStatusBadge = (doc: Document) => {
    if (doc.status === "error") {
      return (
        <span className="documents-list-status-badge">✗ Error</span>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="documents-list-loading">Loading documents...</div>;
  }

  if (error) {
    return (
      <div className="documents-list-error">
        {error instanceof Error ? error.message : "Failed to load documents"}
      </div>
    );
  }

  const documentsByMonth = uniqueDocuments.reduce((acc, doc) => {
    const createdDate = new Date(doc.createdAt);
    const monthKey = `${createdDate.getFullYear()}-${createdDate.getMonth()}`;
    const monthLabel = createdDate.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    if (!acc[monthKey]) {
      acc[monthKey] = {
        monthLabel,
        items: [] as Document[],
      };
    }

    acc[monthKey].items.push(doc);
    return acc;
  }, {} as Record<string, { monthLabel: string; items: Document[] }>);

  const sortedMonthKeys = Object.keys(documentsByMonth).sort((a, b) => {
    const [yearA, monthA] = a.split("-").map(Number);
    const [yearB, monthB] = b.split("-").map(Number);
    const dateA = new Date(yearA, monthA, 1).getTime();
    const dateB = new Date(yearB, monthB, 1).getTime();
    return dateB - dateA;
  });

  if (uniqueDocuments.length === 0) {
    return (
      <div className="documents-list-empty">
        <p className="documents-list-empty-message">
          No documents yet. Upload your first document!
        </p>
      </div>
    );
  }

  return (
    <div className="documents-list">
      {sortedMonthKeys.map((monthKey) => {
        const bucket = documentsByMonth[monthKey];
        return (
          <div key={monthKey} className="documents-month-section">
            <div className="documents-list-header">
              <h2 className="documents-list-title">{bucket.monthLabel}</h2>
            </div>

            <div className="documents-list-container">
              {bucket.items.map((doc) => (
                <div
                  key={doc.id}
                  className={`documents-list-item ${
                    doc.ocrProcessed ? "documents-list-item--clickable" : ""
                  }`}
                  onClick={() => handleDocumentClick(doc)}
                >
                  <div className="documents-list-item-header">
                    <img
                      src={fileIconB}
                      alt="File Icon"
                      className="documents-list-item-icon"
                    />
                    <div className="documents-list-item-content">
                      <h3 className="documents-list-item-filename">
                        {doc.filename}
                      </h3>
                      <div className="documents-list-item-meta">
                        <span>
                          Uploaded{" "}
                          {new Date(doc.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {getStatusBadge(doc) && (
                          <>
                            <span className="documents-list-status-badge-separator">
                              •
                            </span>
                            <span>{getStatusBadge(doc)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="documents-list-item-actions">
                      {doc.ocrProcessed ? (
                        <>
                          <button
                            className="documents-list-action-button documents-list-action-button-share"
                            onClick={(e) => handleShare(e, doc.id)}
                            aria-label="Share document"
                          >
                            <img src={shareIcon} alt="Share" />
                          </button>
                          <button
                            className="documents-list-action-button documents-list-action-button-edit"
                            onClick={(e) => handleEditClick(e, doc)}
                            aria-label="Edit lesson"
                          >
                            <img src={editIcon} alt="Edit" />
                          </button>
                        </>
                      ) : (
                        <div className="documents-list-processing">
                          Processing...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <ShareDrawer
        open={isShareDrawerOpen}
        onOpenChange={setIsShareDrawerOpen}
        quizId={selectedQuizId}
      />

    </div>
  );
}
