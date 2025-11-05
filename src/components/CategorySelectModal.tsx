import { useState } from "react";
import type { CategorySelectModalProps, Category } from "../types/categorySelectModal";
import "../styles/components/_categorySelectModal.scss";

const categories: Category[] = [
  { id: 1, name: "Safety", description: "Safety protocols and procedures" },
  { id: 2, name: "Technical", description: "Technical documentation and guides" },
  { id: 3, name: "Training", description: "Training materials and courses" },
  { id: 4, name: "Workplace", description: "Workplace policies and guidelines" },
  { id: 5, name: "Professional", description: "Professional development resources" },
  { id: 6, name: "General", description: "General documents and information" },
];

export function CategorySelectModal({
  isOpen,
  onSelect,
  onClose,
  filename,
  isSubmitting = false,
}: CategorySelectModalProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSelect = () => {
    if (selectedId && !isSubmitting) {
      onSelect(selectedId);
    }
  };

  return (
    <div className ="container">
    <div className="category-select-modal" onClick={onClose}>
      <div className="category-select-modal__content" onClick={(e) => e.stopPropagation()}>
        <h2 className="category-select-modal__header">Select a Category</h2>
        <p className="category-select-modal__subtitle">
          Choose where to organize <strong>{filename}</strong>
        </p>

        <div className="category-select-modal__categories">
          {categories.map((category) => (
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
          ))}
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
      </div>
    </div>
    </div>
  );
}
