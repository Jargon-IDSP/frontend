import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CategoryFolderWithDocuments } from "@/components/learning/CategoryFolderWithDocuments";
import { CategoriesCard } from "@/components/learning/CategoriesCard";
import { useCategories } from "@/hooks/useCategories";
import { useCreateCategory } from "@/hooks/useCreateCategory";
import { useSmartNavigation } from "@/hooks/useSmartNavigation";
import { AddFolderModal } from "@/components/AddFolderModal";
import folderIcon from "../../assets/icons/folderIcon.svg";
import dictionaryBottom from "../../assets/dictionaryBottom.svg";

export default function Categories() {
  const navigate = useNavigate();
  const { navigateBack } = useSmartNavigation();
  const { data: categories, isLoading, error } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const createCategory = useCreateCategory();

  const handleCreateFolder = async (name: string) => {
    try {
      await createCategory.mutateAsync(name);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    createCategory.reset();
  };

  return (
    <div className="categoriesPage">
      <CategoriesCard
        title="Generated Lessons"
        onBack={() => navigateBack("/learning/custom")}
        rightIcon={
          <img
            src={folderIcon}
            alt="Folder Icon"
            className="categoriesFolderIcon"
            onClick={() => setIsModalOpen(true)}
          />
        }
          bottomImages={[dictionaryBottom]}

      >
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
                <CategoryFolderWithDocuments
                  key={category.id}
                  categoryId={category.id}
                  categoryName={category.name}
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
      </CategoriesCard>
    </div>
  );
}
