import { useState, useEffect } from "react";
import "../styles/components/_addFolderModal.scss";

interface AddFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  isSubmitting?: boolean;
  error?: string | null;
}

export function AddFolderModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  error,
}: AddFolderModalProps) {
  const [folderName, setFolderName] = useState("");

  // Clear input when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFolderName("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folderName.trim() && !isSubmitting) {
      onSubmit(folderName.trim());
      // Don't clear here - let the parent handle success
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFolderName("");
      onClose();
    }
  };

  return (
    <div className="add-folder-modal" onClick={handleClose}>
      <div
        className="add-folder-modal__content"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="add-folder-modal__header">Create New Folder</h2>
        <p className="add-folder-modal__subtitle">
          Give your new folder a name
        </p>

        <form onSubmit={handleSubmit}>
          <div className="add-folder-modal__input-group">
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              className="add-folder-modal__input"
              disabled={isSubmitting}
              autoFocus
            />
            {error && <p className="add-folder-modal__error">{error}</p>}
          </div>

          <div className="add-folder-modal__actions">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="add-folder-modal__button add-folder-modal__button--cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!folderName.trim() || isSubmitting}
              className="add-folder-modal__button add-folder-modal__button--create"
            >
              {isSubmitting ? "Creating..." : "Create Folder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
