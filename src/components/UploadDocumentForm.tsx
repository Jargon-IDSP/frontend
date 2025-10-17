import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";


interface UploadDocumentFormProps {
  onSuccess?: () => void;
}

export function UploadDocumentForm({ onSuccess }: UploadDocumentFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const { getToken } = useAuth();

  // Accepted file types
  const ACCEPTED_TYPES = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate file type
    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      setError(
        "Invalid file type. Please upload a PDF, image (PNG, JPG, GIF, BMP, TIFF), or document file."
      );
      setFile(null);
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      setError("File size must be less than 10MB");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError("");
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

      // Clear the file input
      const fileInput = document.getElementById("document") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ margin: "2rem 0" }}>
        <div style={{ marginBottom: "1rem" }}>
          {/* Hidden file input */}
          <input
            id="document"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.gif,.bmp,.tiff,.doc,.docx,.txt,image/*"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: "none" }}
          />

          {/* Styled label as button */}
          <label
            htmlFor="document"
            style={{
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "1rem",
              fontWeight: "500",
              cursor: uploading ? "not-allowed" : "pointer",
              textAlign: "center",
              opacity: uploading ? 0.6 : 1,
            }}
          >
            📂 Upload Document or Image
          </label>

          <p
            style={{
              fontSize: "0.75rem",
              color: "#666",
              margin: "0.5rem 0 0 0",
            }}
          >
            Accepted: PDF, PNG, JPG, GIF, BMP, TIFF, DOC, DOCX, TXT (max 10MB)
          </p>

          {file && (
            <div
              style={{
                marginTop: "0.75rem",
                padding: "0.75rem",
                backgroundColor: "#f0f9ff",
                borderRadius: "4px",
                border: "1px solid #b3d9ff",
              }}
            >
              <p
                style={{
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  margin: "0 0 0.25rem 0",
                }}
              >
                📄 Selected: {file.name}
              </p>
              <p style={{ fontSize: "0.75rem", color: "#666", margin: "0" }}>
                Size: {(file.size / 1024).toFixed(2)} KB | Type: {file.type}
              </p>
            </div>
          )}
        </div>

        {error && (
          <p
            style={{
              color: "#dc3545",
              backgroundColor: "#f8d7da",
              padding: "0.75rem",
              borderRadius: "4px",
              marginBottom: "1rem",
              fontSize: "0.875rem",
            }}
          >
            ⚠️ {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!file || uploading}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: file && !uploading ? "#0066cc" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: file && !uploading ? "pointer" : "not-allowed",
            fontSize: "1rem",
            fontWeight: "500",
            width: "100%",
          }}
        >
          {uploading ? "⏳ Uploading..." : "📤 Upload Document"}
        </button>
      </form>
    </div>
  );
}
