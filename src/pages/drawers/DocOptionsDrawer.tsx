import { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import bookAddIcon from "@/assets/icons/bookAdd.svg";
import pdfIcon from "@/assets/icons/pdfIcon.svg";
import uploadIcon from "@/assets/icons/uploadIcon.svg";
import deleteIcon from "@/assets/icons/deleteIcon-brown.svg";
import { useNavigate } from "react-router-dom";
import DocumentDrawer from "./DocumentDrawer";
import DeleteDrawer from "./DeleteDrawer";

interface DocumentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DocOptionsDrawer({
  open,
  onOpenChange,
}: DocumentDrawerProps) {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false);

  const handleUpload = () => {
    onOpenChange(false);
    setTimeout(() => {
      setIsDrawerOpen(true);
    }, 200);
  };

  const handleDelete = () => {
    onOpenChange(false);
    setTimeout(() => {
      setIsDeleteDrawerOpen(true);
    }, 200);
  };

  const handleDeleteCancel = () => {
    onOpenChange(true); // Reopen the DocOptionsDrawer
  };

  return (
    <>
      <DocumentDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
      <DeleteDrawer
        open={isDeleteDrawerOpen}
        onOpenChange={setIsDeleteDrawerOpen}
        onCancel={handleDeleteCancel}
      />

      <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
        <DrawerContent className="mx-auto w-[100vw] max-w-[480px]">
          <DrawerHeader>
            <button className="button" onClick={handleUpload}>
              <img src={bookAddIcon} alt="Book with a plus icon" />
              Generate a lesson
            </button>
            <button>
              <img src={pdfIcon} alt="PDF icon" />
              Download to my device
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
