import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";

interface UploadDocumentFormProps {
  onSuccess?: () => void;
}

export function UploadDocumentForm({ onSuccess }: UploadDocumentFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const { getToken } = useAuth();

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

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
    </div>
  );
}
