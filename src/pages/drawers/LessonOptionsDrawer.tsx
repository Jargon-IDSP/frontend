import { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import editNameIcon from "@/assets/icons/editNameIcon.svg";
import addToFolderIcon from "@/assets/icons/addToFolderIcon.svg";
import uploadIcon from "@/assets/icons/uploadIcon.svg";
import deleteIcon from "@/assets/icons/deleteIcon-brown.svg";
// import { useNavigate } from "react-router-dom";
import DocumentDrawer from "./DocumentDrawer";
import DeleteDrawer from "./DeleteDrawer";
import AddToFolderDrawer from "./AddToFolderDrawer";

interface DocumentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LessonOptionsDrawer({
  open,
  onOpenChange,
}: DocumentDrawerProps) {
  //   const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddToFolderDrawerOpen, setIsAddToFolderDrawerOpen] = useState(false);
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false);

  const handleUpload = () => {
    onOpenChange(false);
    setTimeout(() => {
      setIsDrawerOpen(true);
    }, 200);
  };

  const handleAddToFolder = () => {
    onOpenChange(false);
    setTimeout(() => {
      setIsAddToFolderDrawerOpen(true);
    }, 200);
  };

  const handleAddToFolderCancel = () => {
    onOpenChange(true);
  };

  const handleDelete = () => {
    onOpenChange(false);
    setTimeout(() => {
      setIsDeleteDrawerOpen(true);
    }, 200);
  };

  const handleDeleteCancel = () => {
    onOpenChange(true);
  };

  return (
    <>
      <DocumentDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
      <AddToFolderDrawer
        open={isAddToFolderDrawerOpen}
        onOpenChange={setIsAddToFolderDrawerOpen}
        onCancel={handleAddToFolderCancel}
      />
      <DeleteDrawer
        open={isDeleteDrawerOpen}
        onOpenChange={setIsDeleteDrawerOpen}
        onCancel={handleDeleteCancel}
      />

      <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
        <DrawerContent className="mx-auto w-[100vw] max-w-[480px]">
          <DrawerHeader>
            <button className="button" onClick={handleUpload}>
              <img src={editNameIcon} alt="A book and a pen icon" />
              Edit name
            </button>
            <button onClick={handleAddToFolder}>
              <img
                src={addToFolderIcon}
                alt="A folder with a upload symbol icon"
              />
              Add to folder
            </button>
            <button>
              <img src={uploadIcon} alt="Upload icon" />
              Share
            </button>
            <button onClick={handleDelete}>
              <img src={deleteIcon} alt="Trash can icon" />
              Delete
            </button>
          </DrawerHeader>
          <DrawerFooter>
            {/* Horizontal divider */}
            <hr className="my-2 border-gray-200 mb-4" />
            <DrawerClose asChild>
              <Button
                variant="outline"
                className="text-red-500 hover:bg-red-50"
              >
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
