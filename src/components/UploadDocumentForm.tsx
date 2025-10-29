import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { BACKEND_URL } from "../lib/api";
import type {
  UploadDocumentFormProps,
  UploadData,
  SignResponse,
  SaveResponse,
} from "@/types/uploadDocumentForm";

export function UploadDocumentForm({ onSuccess }: UploadDocumentFormProps) {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, token }: UploadData) => {
      // Step 1: Get signed upload URL
      const signRes = await fetch(`${BACKEND_URL}/documents/upload/sign`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: file.name,
          type: file.type,
        }),
      });

      if (!signRes.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadUrl, key }: SignResponse = await signRes.json();

      // Step 2: Upload file to S3
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload file");
      }

      // Step 3: Save document metadata
      const saveRes = await fetch(`${BACKEND_URL}/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileKey: key,
          filename: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      if (!saveRes.ok) {
        throw new Error("Failed to save document");
      }

      const data: SaveResponse = await saveRes.json();
      return data;
    },
    onSuccess: (data) => {
      setFile(null);
      onSuccess();

      if (data.redirectUrl) {
        console.log("🚀 Redirecting to:", data.redirectUrl);
        navigate(data.redirectUrl, {
          state: {
            documentId: data.documentId,
          },
        });
      }
    },
  });

  // Simulate upload progress
  useEffect(() => {
    if (uploadMutation.isPending) {
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          // Slow down as we approach 90% to feel more realistic
          if (prev >= 90) return prev;
          if (prev >= 70) return prev + 2;
          if (prev >= 40) return prev + 5;
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(interval);
    } else if (uploadMutation.isSuccess) {
      setUploadProgress(100);
      // Reset after animation
      const timeout = setTimeout(() => setUploadProgress(0), 1000);
      return () => clearTimeout(timeout);
    } else if (uploadMutation.isError) {
      setUploadProgress(0);
    }
  }, [
    uploadMutation.isPending,
    uploadMutation.isSuccess,
    uploadMutation.isError,
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      uploadMutation.reset(); // Clear any previous errors
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      uploadMutation.mutate({ file, token });
    } catch (err) {
      console.error("Auth error:", err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
    >
      <div>
        <label
          style={{
            display: "block",
            marginBottom: "0.5rem",
            fontWeight: "500",
          }}
        >
          Select Document
        </label>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png"
          disabled={uploadMutation.isPending}
          style={{
            width: "100%",
            padding: "0.5rem",
            border: "2px solid #e5e7eb",
            borderRadius: "6px",
          }}
        />
        <p
          style={{
            fontSize: "0.875rem",
            color: "#6b7280",
            marginTop: "0.5rem",
          }}
        >
          Supported formats: PDF, JPG, PNG
        </p>
      </div>

      {uploadMutation.isError && (
        <div
          style={{
            padding: "0.75rem",
            backgroundColor: "#fee2e2",
            border: "1px solid #ef4444",
            borderRadius: "6px",
            color: "#991b1b",
          }}
        >
          {uploadMutation.error instanceof Error
            ? uploadMutation.error.message
            : "Upload failed"}
        </div>
      )}

      <button
        type="submit"
        disabled={!file || uploadMutation.isPending}
        style={{
          padding: "0.75rem 1.5rem",
          backgroundColor:
            uploadMutation.isPending || !file ? "#d1d5db" : "#10b981",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontWeight: "bold",
          cursor: uploadMutation.isPending || !file ? "not-allowed" : "pointer",
        }}
      >
        {uploadMutation.isPending ? "Uploading..." : "Choose File"}
      </button>

      {uploadMutation.isPending && (
        <div
          style={{
            padding: "0.75rem",
            backgroundColor: "#eff6ff",
            borderRadius: "6px",
            fontSize: "0.875rem",
          }}
        >
          {/* Progress Bar */}
          <div style={{ marginBottom: "0.75rem" }}>
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
                  width: `${uploadProgress}%`,
                  backgroundColor: "#10b981",
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
                color: "#059669",
                fontWeight: "500",
              }}
            >
              {uploadProgress}%
            </div>
          </div>
          <p style={{ margin: 0, textAlign: "center" }}>
            📤 Uploading and processing document... You'll be redirected when
            ready.
          </p>
        </div>
      )}
    </form>
  );
}
