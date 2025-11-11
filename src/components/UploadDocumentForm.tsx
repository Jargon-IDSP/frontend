import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { BACKEND_URL } from "../lib/api";
import type { UploadDocumentFormProps } from "@/types/components/forms";
import type { UploadData, SignResponse, SaveResponse } from "@/types/api/upload";
import { CategorySelectModal } from "./CategorySelectModal";
import { useNotificationContext } from "../contexts/NotificationContext";
import "../styles/components/_uploadDocumentForm.scss";

export function UploadDocumentForm({ onSuccess }: UploadDocumentFormProps) {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const { showErrorToast } = useNotificationContext();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [uploadedData, setUploadedData] = useState<{ key: string; filename: string; fileType: string; fileSize: number; documentId: string } | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async ({ file, token }: UploadData) => {
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

      // Immediately save document to start OCR/translation
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
          categoryId: 6, // Default to General, will be updated when user selects
        }),
      });

      if (!saveRes.ok) {
        throw new Error("Failed to save document");
      }

      const saveData = (await saveRes.json()) as SaveResponse;

      return {
        key,
        filename: file.name,
        fileType: file.type,
        fileSize: file.size,
        documentId: saveData.documentId,
      };
    },
    onSuccess: (data) => {
      setUploadedData(data);
      setShowCategoryModal(true);
    },
    onError: (error) => {
      console.error("Upload error:", error);
      showErrorToast("Creating study materials failed, please upload again", "Upload Failed");
    },
  });

  const finalizeDocumentMutation = useMutation({
    mutationFn: async ({
      documentId,
      categoryId,
      token
    }: {
      documentId: string;
      categoryId: number;
      token: string;
    }) => {
      const finalizeRes = await fetch(`${BACKEND_URL}/documents/${documentId}/finalize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryId,
        }),
      });

      if (!finalizeRes.ok) {
        throw new Error("Failed to finalize document");
      }

      return await finalizeRes.json();
    },
    onSuccess: (_data, variables) => {
      // Navigate AFTER mutation succeeds
      setFile(null);
      setUploadedData(null);
      setShowCategoryModal(false);
      onSuccess();

      // Use stored category name or fallback to "general"
      const categoryName = selectedCategoryName?.toLowerCase() || "general";
      navigate(`/learning/custom/categories/${categoryName}`, {
        state: {
          documentId: variables.documentId,
          justUploaded: true,
        },
      });
    },
    onError: (error) => {
      console.error("Finalize error:", error);
      showErrorToast("Creating study materials failed, please upload again", "Upload Failed");
    },
  });

  const handleCategorySelect = async (categoryId: number, categoryName: string) => {
    if (!uploadedData) return;
    if (finalizeDocumentMutation.isPending) return;

    const token = await getToken();
    if (!token) throw new Error("Authentication required");

    const documentId = uploadedData.documentId;

    // Store category name for navigation
    setSelectedCategoryName(categoryName);

    // Convert category name to lowercase for URL
    const categoryNameLower = categoryName.toLowerCase();

    try {
      // Wait for finalize to complete before navigating
      const response = await fetch(`${BACKEND_URL}/documents/${documentId}/finalize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoryId }),
      });

      if (!response.ok) {
        throw new Error(`Finalize failed: ${response.statusText}`);
      }

      // Navigate only after successful finalization
      setFile(null);
      setUploadedData(null);
      setShowCategoryModal(false);
      onSuccess();

      navigate(`/learning/custom/categories/${categoryNameLower}`, {
        state: { documentId, justUploaded: true },
      });
    } catch (err) {
      console.error("Finalize error:", err);
      // Still navigate even if finalize fails, but log the error
      setFile(null);
      setUploadedData(null);
      setShowCategoryModal(false);
      onSuccess();

      navigate(`/learning/custom/categories/${categoryNameLower}`, {
        state: { documentId, justUploaded: true },
      });
    }
  };

  const handleCategoryModalClose = () => {
    setShowCategoryModal(false);
    setFile(null);
    setUploadedData(null);
  };

  useEffect(() => {
    const isPending = uploadMutation.isPending || finalizeDocumentMutation.isPending;
    const isSuccess = uploadMutation.isSuccess || finalizeDocumentMutation.isSuccess;
    const isError = uploadMutation.isError || finalizeDocumentMutation.isError;

    if (isPending) {
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev;
          if (prev >= 70) return prev + 2;
          if (prev >= 40) return prev + 5;
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(interval);
    } else if (isSuccess) {
      setUploadProgress(100);
      const timeout = setTimeout(() => setUploadProgress(0), 1000);
      return () => clearTimeout(timeout);
    } else if (isError) {
      setUploadProgress(0);
    }
  }, [
    uploadMutation.isPending,
    uploadMutation.isSuccess,
    uploadMutation.isError,
    finalizeDocumentMutation.isPending,
    finalizeDocumentMutation.isSuccess,
    finalizeDocumentMutation.isError,
  ]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      uploadMutation.reset();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) return;

    const token = await getToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    uploadMutation.mutate({ file, token });
  };

  const isLoading = uploadMutation.isPending || finalizeDocumentMutation.isPending;
  const error = uploadMutation.error || finalizeDocumentMutation.error;

  return (
    <form onSubmit={handleSubmit} className="upload-document-form">
      <div className="upload-document-form__field">
        <label className="upload-document-form__label">Select Document</label>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png"
          disabled={isLoading}
          className="upload-document-form__input"
        />
        <p className="upload-document-form__hint">
          Supported formats: PDF, JPG, PNG
        </p>
      </div>

      {error && (
        <div className="upload-document-form__error">
          {error instanceof Error ? error.message : "Upload failed"}
        </div>
      )}

      <button
        type="submit"
        disabled={!file || isLoading}
        className="upload-document-form__button"
      >
        {uploadMutation.isPending
          ? "Uploading..."
          : finalizeDocumentMutation.isPending
          ? "Processing..."
          : "Choose File"}
      </button>

      {isLoading && (
        <div className="upload-document-form__progress">
          <div className="upload-document-form__progress-bar-container">
            <div className="upload-document-form__progress-bar-track">
              <div
                className="upload-document-form__progress-bar-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="upload-document-form__progress-percentage">
              {uploadProgress}%
            </div>
          </div>
          <p className="upload-document-form__progress-text">
            {uploadMutation.isPending
              ? "📤 Uploading and processing document..."
              : "⚡ Generating flashcards..."}
          </p>
        </div>
      )}

      <CategorySelectModal
        isOpen={showCategoryModal}
        onSelect={(categoryId) => handleCategorySelect(categoryId)}
        onClose={handleCategoryModalClose}
        filename={uploadedData?.filename || ""}
        isSubmitting={finalizeDocumentMutation.isPending}
      />
    </form>
  );
}
