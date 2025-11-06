import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useMutation } from "@tanstack/react-query";
import fileIcon from "../../assets/icons/fileIcon.svg";
import goBackIcon from "../../assets/icons/goBackIcon.svg";
import { BACKEND_URL } from "../../lib/api";
import { CategorySelectModal } from "../../components/CategorySelectModal";
import DocumentDrawer from "@/pages/drawers/DocumentDrawer"; // Add this import
import type {
  FileInfo,
  UploadRequest,
  SignResponse,
  SaveResponse,
} from "@/types/api/upload";

export default function FilePreviewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [isAgreementChecked, setIsAgreementChecked] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Add this state
  const [selectedCategory, setSelectedCategory] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const fileInfo = location.state as FileInfo | null;

  const uploadMutation = useMutation({
    mutationFn: async ({
      fileInfo,
      token,
      categoryId,
    }: UploadRequest & { categoryId?: number }): Promise<SaveResponse> => {
      const signRes = await fetch(`${BACKEND_URL}/documents/upload/sign`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: fileInfo.fileName,
          type: fileInfo.fileType,
        }),
      });

      if (!signRes.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadUrl, key }: SignResponse = await signRes.json();

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: fileInfo.file,
        headers: {
          "Content-Type": fileInfo.fileType,
        },
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload file");
      }

      const saveRes = await fetch(`${BACKEND_URL}/documents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: fileInfo.fileName,
          fileType: fileInfo.fileType,
          fileSize: fileInfo.fileSize,
          fileKey: key,
          categoryId: categoryId,
        }),
      });

      if (!saveRes.ok) {
        throw new Error("Failed to save document");
      }

      return await saveRes.json();
    },
    onSuccess: (data) => {
      const categoryName = selectedCategory?.name || "general";
      navigate(`/learning/custom/categories/${categoryName}`, {
        state: {
          justUploaded: true,
          documentId: data.document?.id || data.documentId,
        },
      });
    },
  });

  if (!fileInfo) {
    navigate("/documents");
    return null;
  }

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  const handleBack = () => {
    setIsDrawerOpen(true); // Open drawer instead of navigate(-1)
  };

  const handleBackButton = () => {
    navigate("/learning");
  };

  const CATEGORY_MAP: Record<number, string> = {
    1: "safety",
    2: "technical",
    3: "training",
    4: "workplace",
    5: "professional",
    6: "general",
  };

  const handleCategorySelect = async (categoryId: number) => {
    const categoryName = CATEGORY_MAP[categoryId] || "general";
    setSelectedCategory({ id: categoryId, name: categoryName });
    setShowCategoryModal(false);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      uploadMutation.mutate({
        fileInfo,
        token,
        categoryId: categoryId,
      });
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  const handleUpload = async () => {
    if (!fileInfo) {
      return;
    }

    if (!isAgreementChecked) {
      return;
    }

    setShowCategoryModal(true);
  };

  return (
    <>
      <CategorySelectModal
        isOpen={showCategoryModal}
        onSelect={handleCategorySelect}
        onClose={() => setShowCategoryModal(false)}
        filename={fileInfo?.fileName || ""}
      />

      <DocumentDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />

      <div className="container">
        <button onClick={handleBackButton} className="back-button">
          <h1 className="page-title">
            <img src={goBackIcon} alt="go back" />
            Courses
          </h1>
        </button>

        <div className="preview-section">
          <div className="preview-content">
            <div className="file-preview">
              {fileInfo.fileType.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(fileInfo.file)}
                  alt="File preview"
                  className="preview-image"
                />
              ) : (
                <div className="preview-placeholder">
                  <div className="file-icon">
                    <img src={fileIcon} alt="file" />
                  </div>
                  <p className="file-name-preview">{fileInfo.fileName}</p>
                </div>
              )}
            </div>

            <div className="file-info">
              <p className="file-details">
                Size: {formatFileSize(fileInfo.fileSize)} | Type:{" "}
                {fileInfo.fileType}
              </p>
            </div>

            <div className="action-buttons">
              <button
                className="btn btn-outline back-to-choose-button-preview"
                onClick={handleBack}
              >
                Choose Different File
              </button>

              <div className="agreement-checkbox">
                <label className="checkbox-label">
                  <span className="checkbox-text-required">*</span>
                  <input
                    type="checkbox"
                    checked={isAgreementChecked}
                    onChange={(e) => setIsAgreementChecked(e.target.checked)}
                    className="checkbox-input"
                    disabled={uploadMutation.isPending}
                  />
                  <span className="checkbox-text">
                    I have legal rights to upload this file and it complies with
                    the Acceptable Use Policy.
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="upload-section-preview">
          <button
            className="btn btn-primary upload-button-preview"
            onClick={handleUpload}
            disabled={!isAgreementChecked || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? "Processing..." : "Start"}
          </button>
          <div className="warning-messages">
            <p className="upload-hint-preview">
              AI-generated content may be incomplete or inaccurate.
            </p>
            <p className="upload-hint-preview">
              Review the output and verify important details before sharing or
              publishing.
            </p>
          </div>

          {uploadMutation.isError && (
            <div className="error-message">
              <p className="error-text">
                {uploadMutation.error instanceof Error
                  ? uploadMutation.error.message
                  : "An unexpected error occurred"}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
