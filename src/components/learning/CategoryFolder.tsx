import { useState } from "react";
import type { CategoryFolderProps } from "@/types/categoryFolder";

export function CategoryFolder({
  title,
  icon,
  subtitle,
  locked = false,
  completed = false,
  showDeleteButton = false,
  onDelete,
  children,
  defaultOpen = false,
}: CategoryFolderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggleFolder = () => {
    if (locked) return;
    setIsOpen(!isOpen);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete();
    }
  };

  return (
    <div
      className={`category-folder ${
        locked ? "category-folder--locked" : ""
      } ${completed ? "category-folder--completed" : ""}`}
    >
      <div
        className={`category-folder-header ${
          locked ? "category-folder-header--locked" : ""
        }`}
        onClick={toggleFolder}
      >
        <div className="category-folder-title">
          <h3>
            {icon && <img src={icon} alt="" className="folder-icon" />}
            {title}
          </h3>
          {subtitle && <p className="level-subtitle">{subtitle}</p>}
        </div>
        <div className="category-delete">
          {showDeleteButton && (
            <svg
              className="category-folder-delete"
              onClick={handleDeleteClick}
              width="30"
              height="30"
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
          )}
          </div>
        <div className="category-folder-actions">
          {!locked && (
            <svg
              className={`chevron ${isOpen ? "open" : ""}`}
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
          )}
        </div>
      </div>

      {isOpen && !locked && <div className="category-folder-content">{children}</div>}
    </div>
  );
}
