import { useState, useMemo } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useCreateCategory } from "@/hooks/useCreateCategory";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { AddFolderModal } from "./AddFolderModal";
import folderIcon from "../assets/icons/folderIcon.svg";
import type { CategorySelectModalProps, Category } from "../types/categorySelectModal";
import "../styles/components/_categorySelectModal.scss";

// Default category descriptions
const DEFAULT_DESCRIPTIONS: Record<string, string> = {
  Safety: "Safety protocols and procedures",
  Technical: "Technical documentation and guides",
  Training: "Training materials and courses",
  Workplace: "Workplace policies and guidelines",
  Professional: "Professional development resources",
  General: "General documents and information",
};

export function CategorySelectModal({
  isOpen,
  onSelect,
  onClose,
  filename,
  isSubmitting = false,
}: CategorySelectModalProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: categoriesData, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const { showSuccessToast } = useNotificationContext();

  // Transform categories data to include descriptions
  const categories: Category[] = useMemo(() => {
    if (!categoriesData) return [];

    return categoriesData.map((cat) => ({
      id: cat.id,
      name: cat.name,
      description:
        DEFAULT_DESCRIPTIONS[cat.name] ||
        `Custom category: ${cat.name}`,
    }));
  }, [categoriesData]);

  if (!isOpen) return null;

  const handleCreateFolder = async (name: string) => {
    try {
      const result = await createCategory.mutateAsync(name);
      setIsModalOpen(false);
      
      // Select the newly created category
      if (result?.data?.id) {
        // Wait a bit for categories to refresh, then select the new category
        setTimeout(() => {
          setSelectedId(result.data.id);
        }, 100);
        showSuccessToast("Folder created successfully");
      }
    } catch (error) {
      console.error("Failed to create folder:", error);
      // Error will be shown via the modal's error prop
    }
  };

  const handleSelect = () => {
    if (selectedId && !isSubmitting) {
      const selectedCategory = categories.find((cat) => cat.id === selectedId);
      if (selectedCategory) {
        onSelect(selectedId, selectedCategory.name);
      }
    }
  };

  return (
    <div className ="container">
    <div className="category-select-modal" onClick={onClose}>
      <div className="category-select-modal__content" onClick={(e) => e.stopPropagation()}>
        <div className="category-select-modal__header-container">
          <h2 className="category-select-modal__header">Select a Category</h2>
          <img
            src={folderIcon}
            alt="Create new folder"
            className="category-select-modal__folder-icon"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            style={{ cursor: "pointer" }}
          />
        </div>
        <p className="category-select-modal__subtitle">
          Choose where to organize <strong>{filename}</strong>
        </p>

        <div className="category-select-modal__categories">
          {isLoading ? (
            <div className="category-select-modal__loading">Loading categories...</div>
          ) : categories.length > 0 ? (
            categories.map((category) => (
              <div
                key={category.id}
                onClick={() => setSelectedId(category.id)}
                className={`category-select-modal__category ${
                  selectedId === category.id ? "category-select-modal__category--selected" : ""
                }`}
              >
                <div className="category-select-modal__category-content">
                  <div className="category-select-modal__category-info">
                    <h3 className="category-select-modal__category-name">{category.name}</h3>
                    <p className="category-select-modal__category-description">
                      {category.description}
                    </p>
                  </div>
                  {selectedId === category.id && (
                    <div className="category-select-modal__checkmark">✓</div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="category-select-modal__loading">No categories available</div>
          )}
        </div>

        <div className="category-select-modal__actions">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="category-select-modal__button category-select-modal__button--cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedId || isSubmitting}
            className="category-select-modal__button category-select-modal__button--continue"
          >
            {isSubmitting ? "Continue..." : "Continue"}
          </button>
        </div>
        <AddFolderModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            createCategory.reset();
          }}
          onSubmit={handleCreateFolder}
          isSubmitting={createCategory.isPending}
          error={createCategory.error?.message || null}
        />
      </div>
    </div>
    </div>
  );
}
