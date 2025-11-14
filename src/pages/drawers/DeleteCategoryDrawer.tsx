import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useDeleteCategory } from "../../hooks/useDeleteCategory";
import { useNotificationContext } from "../../contexts/NotificationContext";
import type { DeleteCategoryDrawerProps } from "../../types/deleteCategoryDrawer";

export default function DeleteCategoryDrawer({
  open,
  onOpenChange,
  categoryId,
  categoryName,
}: DeleteCategoryDrawerProps) {
  const deleteCategory = useDeleteCategory();
  const { showSuccessToast, showErrorToast } = useNotificationContext();

  const handleDelete = async () => {
    try {
      const result = await deleteCategory.mutateAsync(categoryId);
      onOpenChange(false);

      // Show success message with details about moved items
      if (result?.message) {
        showSuccessToast(result.message);
      } else {
        showSuccessToast("Folder deleted successfully");
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete folder";
      showErrorToast(errorMessage, "Delete Failed");
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="mx-auto w-[100vw] max-w-[480px]">
        <DrawerHeader>
          <DrawerTitle>Delete Folder</DrawerTitle>
          <DrawerDescription>
            Are you sure you want to delete "{categoryName}"?
            <br />
            <br />
            All documents in this folder will be moved to "Uncategorized".
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-50"
            onClick={handleDelete}
            disabled={deleteCategory.isPending}
          >
            {deleteCategory.isPending ? "Deleting..." : "Delete"}
          </Button>
          <hr className="my-2 border-gray-200 mb-4" />
          <Button
            variant="outline"
            className="text-red-500 hover:bg-red-50"
            onClick={handleCancel}
            disabled={deleteCategory.isPending}
          >
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
