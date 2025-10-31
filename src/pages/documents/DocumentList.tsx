import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useDocuments } from "../../hooks/useDocuments";
import { useDeleteDocument } from "../../hooks/useDeleteDocument";
import QuizShareModal from "../../components/learning/QuizShareModal";
import { BACKEND_URL } from "../../lib/api";
import type { Document, DocumentsListProps } from "../../types/document";

export function DocumentsList({ refresh }: DocumentsListProps) {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [shareModalQuiz, setShareModalQuiz] = useState<{
    id: string;
    name: string;
    documentId: string;
  } | null>(null);

  // Use custom hooks
  const {
    data: documents = [],
    isLoading: loading,
    error,
  } = useDocuments(refresh);
  const deleteMutation = useDeleteDocument();

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

  const handleShare = async (documentId: string) => {
    try {
      const token = await getToken();
      if (!token) {
        alert("Authentication required");
        return;
      }

      // Fetch quizzes for this document
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

  const getStatusBadge = (doc: Document) => {
    if (doc.status === "error") {
      return (
        <span style={{ color: "#ef4444", fontWeight: "bold" }}>✗ Error</span>
      );
    }
    return null;
  };

  if (loading) {
    return <div>Loading documents...</div>;
  }

  if (error) {
    return (
      <div style={{ color: "#ef4444" }}>
        {error instanceof Error ? error.message : "Failed to load documents"}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          backgroundColor: "#f9fafb",
          borderRadius: "8px",
        }}
      >
        <p style={{ color: "#6b7280" }}>
          No documents yet. Upload your first document above!
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2
        style={{
          fontSize: "1.25rem",
          fontWeight: "bold",
          marginBottom: "1rem",
        }}
      >
        My Documents ({documents.length})
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {documents.map((doc) => (
          <div
            key={doc.id}
            style={{
              padding: "1.5rem",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              backgroundColor: "white",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
              }}
            >
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "bold",
                    marginBottom: "0.5rem",
                  }}
                >
                  {doc.filename}
                </h3>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    fontSize: "0.875rem",
                    color: "#6b7280",
                  }}
                >
                  <span>
                    Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                  {getStatusBadge(doc) && (
                    <>
                      <span>•</span>
                      <span>{getStatusBadge(doc)}</span>
                    </>
                  )}
                </div>
              </div>

              {doc.ocrProcessed ? (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => navigate(`/learning/documents/${doc.id}/study`)}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Study
                  </button>

                  <button
                    onClick={() => handleShare(doc.id)}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Share
                  </button>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deleteMutation.isPending}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: deleteMutation.isPending
                        ? "#9ca3af"
                        : "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: deleteMutation.isPending
                        ? "not-allowed"
                        : "pointer",
                    }}
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "#fef3c7",
                    color: "#92400e",
                    border: "1px solid #fbbf24",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                  }}
                >
                  ⏳ Processing...
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {shareModalQuiz && (
        <QuizShareModal
          quizId={shareModalQuiz.id}
          quizName={shareModalQuiz.name}
          onClose={() => setShareModalQuiz(null)}
          onShared={() => setShareModalQuiz(null)}
        />
      )}
    </div>
  );
}
