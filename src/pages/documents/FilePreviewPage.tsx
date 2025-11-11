import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useMutation } from "@tanstack/react-query";
import fileIcon from "../../assets/icons/fileIcon.svg";
import goBackIcon from "../../assets/icons/goBackIcon.svg";
import { BACKEND_URL } from "../../lib/api";
import { CategorySelectModal } from "../../components/CategorySelectModal";
import DocumentDrawer from "@/pages/drawers/DocumentDrawer";
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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
      console.log("Starting upload process...");
      
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
      console.log("Got signed URL, uploading to S3...");

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

      console.log("File uploaded to S3, saving document...");

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
        const errorText = await saveRes.text();
        console.error("Save document failed:", errorText);
        throw new Error("Failed to save document");
      }

      const savedData = await saveRes.json();
      console.log("Document saved successfully:", savedData);
      return savedData;
    },
    onSuccess: (data) => {
      console.log("Upload mutation success, navigating...", data);
      const categoryName = selectedCategory?.name || "general";
      const documentId = data.document?.id || data.documentId;
      
      console.log("Navigating to:", `/learning/custom/categories/${categoryName}`, {
        documentId,
        justUploaded: true,
      });
      
      navigate(`/learning/custom/categories/${categoryName}`, {
        state: {
          justUploaded: true,
          documentId: documentId,
        },
      });
    },
    onError: (error) => {
      console.error("Upload mutation error:", error);
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
    setIsDrawerOpen(true);
  };

  const handleBackButton = () => {
    navigate("/learning");
  };

  const handleCategorySelect = async (categoryId: number, categoryName: string) => {
    // Convert category name to lowercase for URL
    const categoryNameLower = categoryName.toLowerCase();
    setSelectedCategory({ id: categoryId, name: categoryNameLower });
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
