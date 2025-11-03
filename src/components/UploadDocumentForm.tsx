import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { BACKEND_URL } from "../lib/api";
import type { UploadDocumentFormProps } from "@/types/components/forms";
import type { UploadData, SignResponse, SaveResponse } from "@/types/api/upload";
import { CategorySelectModal } from "./CategorySelectModal";
import "../styles/components/_uploadDocumentForm.scss";

const CATEGORY_MAP: Record<number, string> = {
  1: "safety",
  2: "technical",
  3: "training",
  4: "workplace",
  5: "professional",
  6: "general",
};

export function UploadDocumentForm({ onSuccess }: UploadDocumentFormProps) {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [uploadedData, setUploadedData] = useState<{ key: string; filename: string; fileType: string; fileSize: number } | null>(null);

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

      return {
        key,
        filename: file.name,
        fileType: file.type,
        fileSize: file.size,
      };
    },
    onSuccess: (data) => {
      setUploadedData(data);
      setShowCategoryModal(true);
    },
  });

  const saveDocumentMutation = useMutation({
    mutationFn: async ({
      fileKey,
      filename,
      fileType,
      fileSize,
      categoryId,
      token
    }: {
      fileKey: string;
      filename: string;
      fileType: string;
      fileSize: number;
      categoryId: number;
      token: string;
    }) => {
      const saveRes = await fetch(`${BACKEND_URL}/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileKey,
          filename,
          fileType,
          fileSize,
          categoryId,
        }),
      });

      if (!saveRes.ok) {
        throw new Error("Failed to save document");
      }

      return (await saveRes.json()) as SaveResponse;
    },
    onSuccess: (data, variables) => {
      setFile(null);
      setUploadedData(null);
      setShowCategoryModal(false);
      onSuccess();

      const categoryName = CATEGORY_MAP[variables.categoryId] || "general";
      navigate(`/learning/custom/categories/${categoryName}`, {
        state: {
          documentId: data.documentId,
          justUploaded: true,
        },
      });
    },
  });

  const handleCategorySelect = async (categoryId: number) => {
    if (!uploadedData) return;

    // Prevent duplicate submissions
    if (saveDocumentMutation.isPending) {
      console.warn("Save already in progress, ignoring duplicate request");
      return;
    }

    const token = await getToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    saveDocumentMutation.mutate({
      fileKey: uploadedData.key,
      filename: uploadedData.filename,
      fileType: uploadedData.fileType,
      fileSize: uploadedData.fileSize,
      categoryId,
      token,
    });
  };

  const handleCategoryModalClose = () => {
    setShowCategoryModal(false);
    setFile(null);
    setUploadedData(null);
  };

  useEffect(() => {
    const isPending = uploadMutation.isPending || saveDocumentMutation.isPending;
    const isSuccess = uploadMutation.isSuccess || saveDocumentMutation.isSuccess;
    const isError = uploadMutation.isError || saveDocumentMutation.isError;

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
    saveDocumentMutation.isPending,
    saveDocumentMutation.isSuccess,
    saveDocumentMutation.isError,
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

  const isLoading = uploadMutation.isPending || saveDocumentMutation.isPending;
  const error = uploadMutation.error || saveDocumentMutation.error;

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
          : saveDocumentMutation.isPending
          ? "Saving..."
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
              ? "📤 Uploading document..."
              : "💾 Saving document..."}
          </p>
        </div>
      )}

      <CategorySelectModal
        isOpen={showCategoryModal}
        onSelect={(categoryId) => handleCategorySelect(categoryId)}
        onClose={handleCategoryModalClose}
        filename={uploadedData?.filename || ""}
        isSubmitting={saveDocumentMutation.isPending}
      />
    </form>
  );
}
