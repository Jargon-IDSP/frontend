import { useState, useMemo } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";
import { useCreateCategory } from "@/hooks/useCreateCategory";
import { useNotificationContext } from "@/contexts/NotificationContext";
import { AddFolderModal } from "../../components/AddFolderModal";
import folderIcon from "../../assets/icons/folderIcon.svg";
import type {
  CategorySelectDrawerProps,
  Category,
} from "../../types/categorySelectDrawer";

// Default category descriptions
const DEFAULT_DESCRIPTIONS: Record<string, string> = {
  Safety: "Safety protocols and procedures",
  Technical: "Technical documentation and guides",
  Training: "Training materials and courses",
  Workplace: "Workplace policies and guidelines",
  Professional: "Professional development resources",
  General: "General documents and information",
};

export default function CategorySelectDrawer({
  isOpen,
  onSelect,
  onClose,
  filename,
  isSubmitting = false,
}: CategorySelectDrawerProps) {
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
        DEFAULT_DESCRIPTIONS[cat.name] || `Custom category: ${cat.name}`,
    }));
  }, [categoriesData]);

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
    <>
      <Drawer open={isOpen} onOpenChange={onClose} direction="bottom">
        <DrawerContent className="mx-auto w-[100vw] max-w-[480px] max-h-[65vh] sm:max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Select a Category</DrawerTitle>
            <DrawerDescription>
              Choose where to organize <strong>{filename}</strong>
            </DrawerDescription>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Loading categories...
              </div>
            ) : (
              <>
                {categories.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        onClick={() => setSelectedId(category.id)}
                        className={`py-1.5 px-4 rounded-lg border-2 cursor-pointer transition-all bg-white ${
                          selectedId === category.id
                            ? "border-[#fe4d13]"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-base">
                            {category.name}
                          </h3>
                          {selectedId === category.id && (
                            <div className="text-[#fe4d13] text-lg ml-2">✓</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No categories available
                  </div>
                )}

                {/* Add New link */}
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 text-[#fe4d13] hover:text-[#e74611] cursor-pointer transition-colors underline"
                  >
                    <img
                      src={folderIcon}
                      alt="Add folder"
                      className="w-5 h-5"
                    />
                    <span className="font-medium">Add a Custom Category</span>
                  </button>
                </div>
              </>
            )}
          </div>

          <DrawerFooter>
            <div className="flex flex-col sm:flex-row gap-2 w-full">
              <Button
                onClick={handleSelect}
                disabled={!selectedId || isSubmitting}
                className={`w-full sm:flex-1 sm:py-2 ${
                  selectedId && !isSubmitting
                    ? "bg-[#fe4d13] hover:bg-[#e74611] text-white"
                    : ""
                }`}
              >
                {isSubmitting ? "Continue..." : "Continue"}
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:flex-1 text-red-500 hover:bg-red-50 sm:py-2"
              >
                Cancel
              </Button>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

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
    </>
  );
}
