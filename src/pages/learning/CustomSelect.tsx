import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useDocuments } from "../../hooks/useDocuments";
import { useDocumentProcessingStatus } from "../../hooks/useDocumentProcessingStatus";
import { NavigationCard } from "../../components/learning/ui/Card";
import Button from "../../components/learning/ui/Button";

export default function CustomSelect() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [processingDocId, setProcessingDocId] = useState<string | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Use shared documents hook
  const { data: documents = [], isLoading: loading } = useDocuments();

  // Poll document processing status
  const { data: documentStatus } = useDocumentProcessingStatus({
    documentId: processingDocId,
    pollingInterval: 3000,
  });

  const ocrProcessedDocs = documents.filter((doc) => doc.ocrProcessed);
  const processingDocs = documents.filter((doc) => !doc.ocrProcessed);

  // Handle navigation state for new uploads
  useEffect(() => {
    if (location.state?.documentId) {
      setSuccessMessage(
        "Document processing... Generating flashcards and questions."
      );
      setProcessingDocId(location.state.documentId);

      // Clear navigation state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Simulate processing progress
  useEffect(() => {
    if (processingDocId) {
      setProcessingProgress(0);
      const interval = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev >= 95) return prev;
          if (prev >= 80) return prev + 1;
          if (prev >= 60) return prev + 2;
          if (prev >= 30) return prev + 3;
          return prev + 5;
        });
      }, 500);

      return () => clearInterval(interval);
    } else {
      setProcessingProgress(0);
    }
  }, [processingDocId]);

  // Handle document processing completion
  useEffect(() => {
    if (documentStatus?.document?.ocrProcessed && processingDocId) {
      setProcessingProgress(100);

      setTimeout(() => {
        setSuccessMessage(
          "Your document is ready! Flashcards and questions have been generated."
        );
        setProcessingDocId(null);

        // Invalidate documents query to refresh the list
        queryClient.invalidateQueries({ queryKey: ["documents"] });

        // Clear completion message after 8 seconds
        setTimeout(() => {
          setSuccessMessage("");
        }, 8000);
      }, 500);
    }
  }, [documentStatus, processingDocId, queryClient]);

  // Simulate progress while loading
  useEffect(() => {
    if (loading) {
      setLoadingProgress(0);
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + 15;
        });
      }, 150);

      return () => clearInterval(interval);
    } else {
      setLoadingProgress(100);
      const timeout = setTimeout(() => setLoadingProgress(0), 500);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  if (loading) {
    return (
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <h1>Custom Learning</h1>
        {/* Progress Bar */}
        <div style={{ marginTop: "2rem" }}>
          <div
            style={{
              width: "100%",
              height: "8px",
              backgroundColor: "#e5e7eb",
              borderRadius: "9999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${loadingProgress}%`,
                backgroundColor: "#fe4d13",
                transition: "width 0.3s ease-in-out",
                borderRadius: "9999px",
              }}
            />
          </div>
          <div
            style={{
              marginTop: "0.5rem",
              textAlign: "center",
              fontSize: "0.875rem",
              color: "#666",
            }}
          >
            Loading documents... {loadingProgress}%
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <Button
          onClick={() => navigate("/learning/existing/levels")}
          variant="secondary"
        >
          Study Existing Content
        </Button>
      </div>

      <h1>Custom Learning</h1>

      {successMessage && (
        <div
          className={processingDocId ? "processing-message" : "success-message"}
        >
          {processingDocId && (
            <div className="progress-bar-container">
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
              <div className="progress-bar-text">
                Processing: {processingProgress}%
              </div>
            </div>
          )}
          <p className="message-text">{successMessage}</p>
        </div>
      )}

      <h2 style={{ marginTop: "2rem", marginBottom: "1rem" }}>
        Study from a Document
      </h2>
      {processingDocs.length > 0 && (
        <div className="processing-docs-section">
          <p className="processing-docs-label">Processing:</p>
          {processingDocs.map((doc) => (
            <NavigationCard
              key={doc.id}
              icon="📄"
              title={doc.filename}
              onClick={() => {}}
              disabled
            />
          ))}
        </div>
      )}
      {ocrProcessedDocs.length === 0 && processingDocs.length === 0 ? (
        <div
          style={{
            padding: "2rem",
            backgroundColor: "#f9fafb",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <p style={{ marginBottom: "1rem" }}>No processed documents yet.</p>
          <div
            style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}
          >
            <Button
              onClick={() => navigate("/documents/user")}
              variant="primary"
            >
              Go to My Documents
            </Button>
            <Button
              onClick={() => navigate("/learning/shared")}
              variant="secondary"
            >
              Shared with Me
            </Button>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            marginBottom: "2rem",
          }}
        >
          {ocrProcessedDocs.map((doc) => (
            <NavigationCard
              key={doc.id}
              icon="📄"
              title={doc.filename}
              onClick={() => navigate(`/learning/documents/${doc.id}/study`)}
            />
          ))}
        </div>
      )}

      <h2 style={{ marginTop: "2rem", marginBottom: "1rem" }}>
        View My Generated Lessons
      </h2>
      <NavigationCard
        icon="📝"
        title="My Generated Lessons"
        description="Review your generated flashcards and take quizzes"
        onClick={() => navigate("/learning/custom/categories")}
      />

      <h2 style={{ marginTop: "2rem", marginBottom: "1rem" }}>Other Options</h2>
      <NavigationCard
        icon="📝"
        title="All Custom Terms"
        description="Review all your custom flashcards"
        onClick={() => navigate("/learning/custom/terms")}
      />
    </div>
  );
}
