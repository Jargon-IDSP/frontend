import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import RockySpeechBubble from "../../components/RockySpeechBubble";
import { SimpleFileUpload } from "../../components/SimpleFileUpload";
import { BACKEND_URL } from "../../lib/api";

interface DocumentStatusResponse {
  document: {
    ocrProcessed: boolean;
  };
}

export default function DocumentsPage() {
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showPrebuiltLink, setShowPrebuiltLink] = useState(false);
  const [processingDocId, setProcessingDocId] = useState<string | null>(null);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { getToken } = useAuth();

  // Poll document status using TanStack Query
  const { data: documentStatus } = useQuery({
    queryKey: ["documentStatus", processingDocId],
    queryFn: async (): Promise<DocumentStatusResponse> => {
      if (!processingDocId) {
        throw new Error("No document ID");
      }

      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/documents/${processingDocId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch document status");
      }

      return await res.json();
    },
    enabled: !!processingDocId && !processingComplete, // Only poll when we have a docId and not complete
    refetchInterval: 3000, // Poll every 3 seconds
    retry: false, // Don't retry failed requests
  });

  // Simulate processing progress
  useEffect(() => {
    if (processingDocId && !processingComplete) {
      setProcessingProgress(0);
      const interval = setInterval(() => {
        setProcessingProgress((prev) => {
          // Slow, realistic progress for document processing
          if (prev >= 95) return prev; // Stop at 95% until actually complete
          if (prev >= 80) return prev + 1; // Very slow near end
          if (prev >= 60) return prev + 2; // Slow
          if (prev >= 30) return prev + 3; // Medium
          return prev + 5; // Initial fast progress
        });
      }, 500); // Slower intervals for document processing

      return () => clearInterval(interval);
    } else {
      setProcessingProgress(0);
    }
  }, [processingDocId, processingComplete]);

  // Handle document processing completion
  useEffect(() => {
    if (documentStatus?.document?.ocrProcessed && !processingComplete) {
      setProcessingProgress(100); // Complete the progress bar

      // Small delay to show 100% before changing message
      setTimeout(() => {
        setProcessingComplete(true);
        setSuccessMessage(
          "🎉 Your document is ready! Flashcards and questions have been generated."
        );
        setShowPrebuiltLink(false);
        setProcessingDocId(null);

        setTimeout(() => {
          setSuccessMessage("");
          setProcessingComplete(false);
        }, 8000);
      }, 500);
    }
  }, [documentStatus, processingComplete]);

  // Handle location state (from navigation)
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setShowPrebuiltLink(location.state?.showPrebuiltLink || false);

      if (location.state?.documentId) {
        setProcessingDocId(location.state.documentId);
      }

      const timer = setTimeout(() => {
        if (!processingComplete) {
          setSuccessMessage("");
          setShowPrebuiltLink(false);
        }
      }, 10000);

      navigate(location.pathname, { replace: true, state: {} });

      return () => clearTimeout(timer);
    }
  }, [location.state, navigate, location.pathname, processingComplete]);

  return (
    <div className="container">
      {/* <button onClick={() => navigate("/")} className="back-button">
        ← Back to Dashboard
      </button> */}

      <h1 className="page-title">AI Translate & Lesson</h1>

      <RockySpeechBubble
        text="Upload your documents and I'll turn them into bite-sized lessons!"
        className="documents-speech-bubble"
      />

      {successMessage && (
        <div className="success-message">
          {processingDocId && !processingComplete && (
            <div style={{ marginBottom: "0.75rem" }}>
              <div
                style={{
                  width: "100%",
                  height: "8px",
                  backgroundColor: "#fef3c7",
                  border: "1px solid #fbbf24",
                  borderRadius: "9999px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${processingProgress}%`,
                    backgroundColor: "#f59e0b",
                    transition: "width 0.5s ease-in-out",
                    borderRadius: "9999px",
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: "0.5rem",
                  textAlign: "center",
                  fontSize: "0.875rem",
                  color: "#92400e",
                  fontWeight: "500",
                }}
              >
                Processing: {processingProgress}%
              </div>
            </div>
          )}
          <p className="success-text">
            {successMessage}
            {showPrebuiltLink && (
              <>
                {" "}
                <button
                  onClick={() => navigate("/learning")}
                  className="inline-link-button"
                  style={{
                    color: "#3b82f6",
                    textDecoration: "underline",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "inherit",
                    padding: 0,
                    fontWeight: "600",
                  }}
                >
                  Click here
                </button>
              </>
            )}
            {processingComplete && processingDocId && (
              <>
                {" "}
                <button
                  onClick={() =>
                    navigate(`/documents/${processingDocId}/translation`)
                  }
                  style={{
                    marginLeft: "10px",
                    padding: "8px 16px",
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  View Translation
                </button>
              </>
            )}
          </p>
        </div>
      )}

      <div className="upload-section">
        <SimpleFileUpload />
      </div>
    </div>
  );
}
