import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDocumentsByCategory } from "../../hooks/useDocumentsByCategory";
import { useDeleteCategory } from "../../hooks/useDeleteCategory";
import { useNotificationContext } from "../../contexts/NotificationContext";
import type { CategoryFolderProps } from "../../types/learning";

// Default category names that should never show delete button
const DEFAULT_CATEGORIES = [
  "General",
  "Professional",
  "Safety",
  "Technical",
  "Training",
  "Workplace",
];

export function CategoryFolder({
  categoryId,
  categoryName,
  isDefault,
}: CategoryFolderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();
  const { data: documents, isLoading } = useDocumentsByCategory(categoryName);
  const deleteCategory = useDeleteCategory();
  const { showSuccessToast, showErrorToast } = useNotificationContext();

  // Check if this is a default category or "Uncategorized" (by isDefault flag or by name)
  const isDefaultCategory = isDefault || DEFAULT_CATEGORIES.includes(categoryName) || categoryName === "Uncategorized";

  const handleDelete = async () => {
    try {
      const result = await deleteCategory.mutateAsync(categoryId);
      setShowDeleteConfirm(false);
      
      // Show success message with details about moved items
      if (result?.message) {
        showSuccessToast(result.message);
      } else {
        showSuccessToast("Folder deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete folder";
      showErrorToast(errorMessage, "Delete Failed");
    }
  };

  const toggleFolder = () => {
    setIsOpen(!isOpen);
  };

  const handleDocumentClick = (documentId: string) => {
    navigate(`/learning/documents/${documentId}/study`);
  };

  return (
    <div className="category-folder">
      <div className="category-folder-header" onClick={toggleFolder}>
        <div className="category-folder-title">
          <h3>{categoryName}</h3>
        </div>
        <div className="category-folder-actions" onClick={(e) => e.stopPropagation()}>
          {!isDefaultCategory && (
            <button
              className="category-folder-delete"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              disabled={deleteCategory.isPending}
              title="Delete folder"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
          <svg
            className={`chevron ${isOpen ? 'open' : ''}`}
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="category-folder-delete-confirm">
          <p>Are you sure you want to delete "{categoryName}"?</p>
          <div className="category-folder-delete-actions">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleteCategory.isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteCategory.isPending}
              className="delete-confirm-button"
            >
              {deleteCategory.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="category-folder-content">
          {isLoading ? (
            <div className="folder-loading">Loading lessons...</div>
          ) : documents && documents.length > 0 ? (
            <div className="document-list">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="document-item"
                  onClick={() => handleDocumentClick(doc.id)}
                >
                  <div className="document-info">
                    <span className="document-name">{doc.filename}</span>
                    <div className="document-stats">
                      {doc.flashcardCount > 0 && (
                        <span className="stat">{doc.flashcardCount} flashcards</span>
                      )}
                      {doc.questionCount > 0 && (
                        <span className="stat">{doc.questionCount} questions</span>
                      )}
                    </div>
                  </div>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              ))}
            </div>
          ) : (
            <div className="folder-empty">
              No lessons in this category yet. Upload a document to get started!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
