import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CategoryFolder } from "@/components/learning/CategoryFolder";
import { useCategories } from "@/hooks/useCategories";
import { useCreateCategory } from "@/hooks/useCreateCategory";
import { AddFolderModal } from "@/components/AddFolderModal";
import folderIcon from "../../assets/icons/folderIcon.svg";
import goBackIcon from "../../assets/icons/goBackIcon.svg";

export default function Categories() {
  const navigate = useNavigate();
  const { data: categories, isLoading, error } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const createCategory = useCreateCategory();

  const handleCreateFolder = async (name: string) => {
    try {
      await createCategory.mutateAsync(name);
      setIsModalOpen(false);
    } catch (error) {
      // Error is handled by the modal's error prop
      console.error("Failed to create folder:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Reset mutation state when closing
    createCategory.reset();
  };

  return (
    <div className="categoriesPage">
      <div className="categoriesHeader">
        <img
          src={goBackIcon}
          alt="Go back"
          className="categoriesBackButton"
          onClick={() => navigate(-1)}
        />
        <h1>My Generated Lessons</h1>
        <img
          src={folderIcon}
          alt="Folder Icon"
          className="categoriesFolderIcon"
          onClick={() => setIsModalOpen(true)}
          style={{ cursor: "pointer" }}
        />
      </div>

      {isLoading ? (
        <div className="categoriesLoading">Loading categories...</div>
      ) : error ? (
        <div className="categoriesError">
          Failed to load categories. Please try again.
        </div>
      ) : (
        <div className="categoriesList">
          {categories && categories.length > 0 ? (
            categories.map((category) => (
              <CategoryFolder
                key={category.id}
                categoryId={category.id}
                categoryName={category.name}
                documentCount={category.documentCount}
                isDefault={category.isDefault}
              />
            ))
          ) : (
            <div className="categoriesEmpty">
              No categories found. Upload a document to create your first
              lesson!
            </div>
          )}
        </div>
      )}

      <AddFolderModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateFolder}
        isSubmitting={createCategory.isPending}
        error={createCategory.error?.message || null}
      />
    </div>
  );
}
