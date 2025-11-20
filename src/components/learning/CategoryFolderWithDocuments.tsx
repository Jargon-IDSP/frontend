import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CategoryFolder } from "./CategoryFolder";
import { useDocumentsByCategory } from "../../hooks/useDocumentsByCategory";
import DeleteCategoryDrawer from "../../pages/drawers/DeleteCategoryDrawer";

interface CategoryFolderWithDocumentsProps {
  categoryId: number;
  categoryName: string;
  isDefault: boolean;
}

// Default category names that should never show delete button
const DEFAULT_CATEGORIES = [
  "General",
  "Professional",
  "Safety",
  "Technical",
  "Training",
  "Workplace",
];

export function CategoryFolderWithDocuments({
  categoryId,
  categoryName,
  isDefault,
}: CategoryFolderWithDocumentsProps) {
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const { data: documents, isLoading } = useDocumentsByCategory(categoryName);

  const isDefaultCategory =
    isDefault || DEFAULT_CATEGORIES.includes(categoryName) || categoryName === "Uncategorized";

  const handleDocumentClick = (documentId: string) => {
    navigate(`/learning/documents/${documentId}/study`);
  };

  const handleDelete = () => {
    setIsDeleteDrawerOpen(true);
  };

  return (
    <>
      <DeleteCategoryDrawer
        open={isDeleteDrawerOpen}
        onOpenChange={setIsDeleteDrawerOpen}
        categoryId={categoryId}
        categoryName={categoryName}
      />

      <CategoryFolder
        title={categoryName}
        showDeleteButton={!isDefaultCategory}
        onDelete={handleDelete}
      >
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
      </CategoryFolder>
    </>
  );
}
