import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";
import { useDocumentCategory } from "@/hooks/useDocumentCategory";
import { useUpdateDocumentCategory } from "@/hooks/useUpdateDocumentCategory";
import { useCreateCategory } from "@/hooks/useCreateCategory";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { AddFolderModal } from "@/components/AddFolderModal";
import "../../styles/components/_addToFolderDrawer.scss";

interface AddToFolderDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel?: () => void;
  documentId: string | null;
}

export default function AddToFolderDrawer({
  open,
  onOpenChange,
  onCancel,
  documentId,
}: AddToFolderDrawerProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: currentCategoryId, isLoading: categoryLoading } =
    useDocumentCategory(documentId);
  const updateCategory = useUpdateDocumentCategory();
  const createCategory = useCreateCategory();
  const { showSuccessToast, showErrorToast } = useNotificationContext();

  // Set initial selected category when data loads
  useEffect(() => {
    if (currentCategoryId !== undefined && currentCategoryId !== null) {
      setSelectedCategoryId(currentCategoryId);
    }
  }, [currentCategoryId]);

  const handleCancel = () => {
    // Reset selection to current category
    if (currentCategoryId !== undefined && currentCategoryId !== null) {
      setSelectedCategoryId(currentCategoryId);
    }
    onOpenChange(false);
    if (onCancel) {
      setTimeout(() => {
        onCancel();
      }, 200);
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      const result = await createCategory.mutateAsync(name);
      setIsModalOpen(false);

      // Select the newly created category
      if (result?.data?.id) {
        // Wait a bit for categories to refresh, then select the new category
        setTimeout(() => {
          setSelectedCategoryId(result.data.id);
        }, 100);
        showSuccessToast("Folder created successfully");
      }
    } catch (error) {
      console.error("Failed to create folder:", error);
      // Error will be shown via the modal's error prop
    }
  };

  const handleSave = async () => {
    if (!documentId || !selectedCategoryId) {
      showErrorToast("Please select a folder");
      return;
    }

    // Don't update if it's the same category
    if (selectedCategoryId === currentCategoryId) {
      handleCancel();
      return;
    }

    try {
      await updateCategory.mutateAsync({
        documentId,
        categoryId: selectedCategoryId,
      });
      showSuccessToast("Document moved to folder successfully");
      handleCancel();
    } catch (error) {
      console.error("Error moving document:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to move document";
      showErrorToast(errorMessage, "Moving Document Failed");
    }
  };

  const isLoading = categoriesLoading || categoryLoading;

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="mx-auto w-[100vw] max-w-[480px] add-to-folder-drawer">
        <DrawerHeader>
          <Button
            variant="outline"
            className="mt-2 mb-4 text-[#FE4D13] border-[#FE4D13] hover:bg-[#FE4D13] hover:text-white"
            onClick={() => setIsModalOpen(true)}
            disabled={isLoading}
          >
            + New folder
          </Button>
          {isLoading ? (
            <div className="py-4 text-center text-gray-500">
              Loading folders...
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="py-2 max-h-[60vh] overflow-y-auto">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="category"
                    value={category.id}
                    checked={selectedCategoryId === category.id}
                    onChange={() => setSelectedCategoryId(category.id)}
                    className="radio-button-custom"
                  />
                  <span className="flex-1 font-medium">{category.name}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-gray-500">
              No folders available
            </div>
          )}
        </DrawerHeader>
        <DrawerFooter>
          <Button
            variant="outline"
            className="text-white bg-green-500 hover:bg-green-600"
            onClick={handleSave}
            disabled={
              !selectedCategoryId || updateCategory.isPending || isLoading
            }
          >
            {updateCategory.isPending ? "Saving..." : "Save"}
          </Button>
          {/* Horizontal divider */}
          <hr className="my-2 border-gray-200 mb-4" />
          <Button
            variant="outline"
            className="text-red-500 hover:bg-red-50"
            onClick={handleCancel}
            disabled={updateCategory.isPending}
          >
            Cancel
          </Button>
        </DrawerFooter>
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
      </DrawerContent>
    </Drawer>
  );
}
