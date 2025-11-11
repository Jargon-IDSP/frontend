import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useQueryClient } from "@tanstack/react-query";
import { useDocuments } from "../../hooks/useDocuments";
import { useDeleteDocument } from "../../hooks/useDeleteDocument";
import { useDocumentProcessingStatus } from "../../hooks/useDocumentProcessingStatus";
import ShareModal from "../../components/learning/ShareModal";
import { BACKEND_URL } from "../../lib/api";
import type { Document, DocumentsListProps } from "../../types/document";
import "../../styles/components/_documentList.scss";
import fileIconB from "../../assets/icons/fileIconB.svg";
import deleteIcon from "../../assets/icons/deleteIcon.svg";
import shareIcon from "../../assets/icons/shareIcon.svg";

export function DocumentsList({ refresh }: DocumentsListProps) {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);
  const documentsListRef = useRef<HTMLDivElement>(null);
  const [shareModalQuiz, setShareModalQuiz] = useState<{
    id: string;
    name: string;
    documentId: string;
  } | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        documentsListRef.current &&
        !documentsListRef.current.contains(event.target as Node) &&
        isEditMode
      ) {
        setIsEditMode(false);
      }
    };

    if (isEditMode) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditMode]);

  const {
    data: documents = [],
    isLoading: loading,
    error,
  } = useDocuments(refresh);
  const deleteMutation = useDeleteDocument();

  // Deduplicate documents by ID (in case cache returns duplicates)
  const uniqueDocuments = Array.from(
    new Map(documents.map(doc => [doc.id, doc])).values()
  );

  const processingDocuments = uniqueDocuments.filter((doc) => !doc.ocrProcessed);
  const processingDocId = processingDocuments.length > 0 ? processingDocuments[0].id : null;

  const { data: processingStatus } = useDocumentProcessingStatus({
    documentId: processingDocId,
  });

  useEffect(() => {
    if (processingStatus?.status.status === 'completed') {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    }
  }, [processingStatus?.status.status, queryClient]);

  const handleDelete = async (documentId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this document? This will also delete all associated flashcards and quizzes."
      )
    ) {
      return;
    }

    deleteMutation.mutate(documentId);
  };

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
          setShareModalQuiz({
            id: quizzes[0].id,
            name: quizzes[0].name,
            documentId,
          });
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
    if (isEditMode) {
      return;
    }

    if (doc.ocrProcessed) {
      navigate(`/learning/documents/${doc.id}/study`);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, documentId: string) => {
    e.stopPropagation();
    handleDelete(documentId);
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

  if (uniqueDocuments.length === 0) {
    return (
      <div className="documents-list-empty">
        <p className="documents-list-empty-message">
          No documents yet. Upload your first document above!
        </p>
      </div>
    );
  }

  return (
    <div className="documents-list" ref={documentsListRef}>
      <div className="documents-list-header">
        <h2 className="documents-list-title">
          My Documents
        </h2>
        <button
          className="documents-list-edit-toggle"
          onClick={() => setIsEditMode(!isEditMode)}
          aria-label={isEditMode ? "Exit edit mode" : "Edit documents"}
        >
          <p>Edit</p>
        </button>
      </div>

      <div className="documents-list-container">
        {uniqueDocuments.map((doc) => (
          <div
            key={doc.id}
            className={`documents-list-item ${doc.ocrProcessed && !isEditMode ? 'documents-list-item--clickable' : ''}`}
            onClick={() => handleDocumentClick(doc)}
          >
            <div className="documents-list-item-header">
              <img src={fileIconB} alt="File Icon" className="documents-list-item-icon" />
              <div className="documents-list-item-content">
                <h3 className="documents-list-item-filename">
                  {doc.filename}
                </h3>
                <div className="documents-list-item-meta">
                  <span>
                    Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                  {getStatusBadge(doc) && (
                    <>
                      <span className="documents-list-status-badge-separator">•</span>
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
                    
                    {isEditMode && (
                      <button
                        className="documents-list-action-button documents-list-action-button-delete"
                        onClick={(e) => handleDeleteClick(e, doc.id)}
                        disabled={deleteMutation.isPending}
                        aria-label="Delete document"
                      >
                        <img src={deleteIcon} alt="Delete" />
                      </button>
                    )}
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

      {shareModalQuiz && (
        <ShareModal
          isOpen={true}
          quizId={shareModalQuiz.id}
          quizName={shareModalQuiz.name}
          onClose={() => setShareModalQuiz(null)}
        />
      )}
    </div>
  );
}
