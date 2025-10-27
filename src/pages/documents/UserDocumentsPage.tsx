import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useDocumentProcessingStatus } from "../../hooks/useDocumentProcessingStatus";
import { DocumentsList } from "./DocumentList";

export default function UserDocumentsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [refreshKey, setRefreshKey] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [processingDocId, setProcessingDocId] = useState<string | null>(null);

  // Use custom hook for polling document status
  const { data: documentStatus } = useDocumentProcessingStatus({
    documentId: processingDocId,
    pollingInterval: 3000,
  });

  // Handle document processing completion
  useEffect(() => {
    if (documentStatus?.document?.ocrProcessed && processingDocId) {
      setSuccessMessage(
        "🎉 Your document is ready! Flashcards and questions have been generated."
      );
      setProcessingDocId(null);
      setRefreshKey((prev) => prev + 1);

      // Invalidate documents query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["documents"] });

      // Clear completion message after 8 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 8000);
    }
  }, [documentStatus, processingDocId, queryClient]);

  // Handle success message from navigation state
  useEffect(() => {
    if (location.state?.documentId) {
      // Show processing message and start polling
      setSuccessMessage(
        "⏳ Document processing... Generating flashcards and questions."
      );
      setProcessingDocId(location.state.documentId);
      setRefreshKey((prev) => prev + 1);

      // Clear navigation state to prevent re-triggering on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  return (
    <div className="container">
      <button
        onClick={() => navigate("/learning/custom")}
        className="back-button"
      >
        ← Back to Custom Learning
      </button>

      <h1 className="page-title">My Documents</h1>

      <p style={{ marginBottom: "2rem", color: "#666" }}>
        View and manage all your uploaded documents
      </p>

      {successMessage && (
        <div
          className="success-message"
          style={{
            backgroundColor: processingDocId ? "#fef3c7" : "#d1fae5",
            border: processingDocId ? "1px solid #fbbf24" : "1px solid #10b981",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "2rem",
          }}
        >
          <p
            className="success-text"
            style={{
              margin: 0,
              color: processingDocId ? "#92400e" : "#065f46",
            }}
          >
            {successMessage}
          </p>
        </div>
      )}

      <DocumentsList refresh={refreshKey} />
    </div>
  );
}
