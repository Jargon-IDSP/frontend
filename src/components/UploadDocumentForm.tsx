import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

interface Document {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number | null;
  createdAt: string;
}

interface UploadDocumentFormProps {
  onSuccess?: () => void;
}

export function UploadDocumentForm({ onSuccess }: UploadDocumentFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { getToken } = useAuth();

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  // Fetch user's documents
  const fetchDocuments = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/documents`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const token = await getToken();

      const signResponse = await fetch(`${BACKEND_URL}/documents/upload/sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ filename: file.name, type: file.type }),
      });

      if (!signResponse.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, key } = await signResponse.json();

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) throw new Error("Failed to upload file");

      const saveResponse = await fetch(`${BACKEND_URL}/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          fileKey: key,
          filename: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      if (!saveResponse.ok) throw new Error("Failed to save document metadata");

      console.log("Upload successful!");
      alert("Upload successful!");
      setFile(null);

      // Refresh the documents list
      await fetchDocuments();
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    setDeletingId(documentId);

    try {
      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/documents/${documentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to delete document");

      alert("Document deleted successfully!");

      // Refresh the documents list
      await fetchDocuments();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ margin: "2rem 0" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label
            htmlFor="document"
            style={{
              display: "block",
              marginBottom: "0.5rem",
              fontWeight: "bold",
            }}
          >
            Upload Document
          </label>
          <input
            id="document"
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: "block" }}
          />
          {file && (
            <p
              style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#666" }}
            >
              Selected: {file.name}
            </p>
          )}
        </div>

        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

        <button
          type="submit"
          disabled={!file || uploading}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: file && !uploading ? "#0066cc" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: file && !uploading ? "pointer" : "not-allowed",
          }}
        >
          {uploading ? "Uploading..." : "Upload Document"}
        </button>
      </form>

      {/* Documents List */}
      <div style={{ marginTop: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Your Documents</h3>

        {loadingDocuments ? (
          <p>Loading documents...</p>
        ) : documents.length === 0 ? (
          <p style={{ color: "#666" }}>No documents uploaded yet.</p>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {documents.map((doc) => (
              <div
                key={doc.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  // backgroundColor: "#f9f9f9",
                }}
              >
                <div>
                  <p style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>
                    {doc.filename}
                  </p>
                  <p style={{ fontSize: "0.85rem", color: "#666" }}>
                    {formatFileSize(doc.fileSize)} •{" "}
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(doc.id)}
                  disabled={deletingId === doc.id}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: deletingId === doc.id ? "#ccc" : "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: deletingId === doc.id ? "not-allowed" : "pointer",
                  }}
                >
                  {deletingId === doc.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
