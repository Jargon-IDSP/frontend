import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDocumentsByCategory } from "../../hooks/useDocumentsByCategory";
import type { CategoryFolderProps } from "../../types/learning";

export function CategoryFolder({ categoryName }: CategoryFolderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { data: documents, isLoading } = useDocumentsByCategory(categoryName);

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
