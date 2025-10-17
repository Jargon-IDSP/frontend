// components/DocumentsList.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";

interface Document {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number | null;
  createdAt: string;
  extractedText?: string;
  ocrProcessed?: boolean;
}

interface DocumentsListProps {
  refresh?: number;
}

export function DocumentsList({ refresh }: DocumentsListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [processingOCR, setProcessingOCR] = useState<string | null>(null);
  const { getToken } = useAuth();

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = await getToken();

      const response = await fetch(`${BACKEND_URL}/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch documents");

      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [refresh]);

  const handleDownload = async (docId: string) => {
    setDownloadingId(docId);

    try {
      const token = await getToken();

      const response = await fetch(
        `${BACKEND_URL}/documents/${docId}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Failed to get download URL");

      const { downloadUrl } = await response.json();

      window.open(downloadUrl, "_blank");
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download file");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    setDeletingId(docId);

    try {
      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/documents/${docId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete document");

      alert("Document deleted successfully!");
      await fetchDocuments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleTriggerOCR = async (docId: string) => {
    setProcessingOCR(docId);

    try {
      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/documents/${docId}/ocr`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to trigger OCR");

      alert("OCR processing completed! Check the document.");
      await fetchDocuments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "OCR trigger failed");
    } finally {
      setProcessingOCR(null);
    }
  };

  if (isLoading)
    return (
      <p style={{ padding: "1.5rem", color: "#666" }}>Loading documents…</p>
    );
  if (error) return <p style={{ padding: "1.5rem", color: "red" }}>{error}</p>;

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "1.5rem",
      }}
    >
      <h3
        style={{
          fontSize: "1.125rem",
          fontWeight: "bold",
          marginBottom: "1rem",
        }}
      >
        Uploaded Documents
      </h3>

      {documents.length > 0 ? (
        <div>
          {documents.map((doc) => (
            <div
              key={doc.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.75rem",
                border: "1px solid #e5e5e5",
                borderRadius: "4px",
                marginBottom: "0.5rem",
              }}
            >
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.875rem", fontWeight: "500" }}>
                  {doc.filename}
                </p>
                <p style={{ fontSize: "0.75rem", color: "#666" }}>
                  Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                </p>
                {doc.ocrProcessed && (
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "#28a745",
                      marginTop: "0.25rem",
                    }}
                  >
                    ✓ OCR Processed
                  </p>
                )}
              </div>

              {/* Button Group */}
              <div
                style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
              >
                <button
                  onClick={() => handleTriggerOCR(doc.id)}
                  disabled={processingOCR === doc.id || doc.ocrProcessed}
                  style={{
                    padding: "0.5rem 0.75rem",
                    backgroundColor:
                      processingOCR === doc.id || doc.ocrProcessed
                        ? "#ccc"
                        : "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    cursor:
                      processingOCR === doc.id || doc.ocrProcessed
                        ? "not-allowed"
                        : "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {processingOCR === doc.id
                    ? "⏳ Processing..."
                    : doc.ocrProcessed
                    ? "✓ OCR Done"
                    : "📝 Extract Text"}
                </button>

                <button
                  onClick={() => handleDownload(doc.id)}
                  disabled={downloadingId === doc.id}
                  style={{
                    padding: "0.5rem 0.75rem",
                    backgroundColor:
                      downloadingId === doc.id ? "#ccc" : "#0066cc",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    cursor:
                      downloadingId === doc.id ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {downloadingId === doc.id ? "⏳ Loading..." : "📄 Download"}
                </button>

                <button
                  onClick={() => handleDelete(doc.id)}
                  disabled={deletingId === doc.id}
                  style={{
                    padding: "0.5rem 0.75rem",
                    backgroundColor: deletingId === doc.id ? "#ccc" : "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    cursor: deletingId === doc.id ? "not-allowed" : "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {deletingId === doc.id ? "⏳ Deleting..." : "🗑️ Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: "0.875rem", color: "#666" }}>
          No documents uploaded yet.
        </p>
      )}
    </div>
  );
}
