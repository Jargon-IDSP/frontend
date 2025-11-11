import { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import bookAddIcon from "@/assets/icons/bookAdd.svg";
import pdfIcon from "@/assets/icons/pdfIcon.svg";
import uploadIcon from "@/assets/icons/uploadIcon.svg";
import deleteIcon from "@/assets/icons/deleteIcon-brown.svg";
import DocumentDrawer from "./DocumentDrawer";
import DeleteDrawer from "./DeleteDrawer";
import ShareDrawer from "./ShareDrawer";
import type { DocOptionsDrawerProps } from "../../types/docOptionsDrawer";

export default function DocOptionsDrawer({
  open,
  onOpenChange,
  documentId,
  documentName,
  quizId,
}: DocOptionsDrawerProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false);
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false);

  const handleUpload = () => {
    onOpenChange(false);
    setTimeout(() => {
      setIsDrawerOpen(true);
    }, 200);
  };

  const handleShare = () => {
    onOpenChange(false);
    setTimeout(() => {
      setIsShareDrawerOpen(true);
    }, 200);
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
      <ShareDrawer
        open={isShareDrawerOpen}
        onOpenChange={setIsShareDrawerOpen}
        quizId={quizId}
      />
      <DeleteDrawer
        open={isDeleteDrawerOpen}
        onOpenChange={setIsDeleteDrawerOpen}
        onCancel={handleDeleteCancel}
        documentId={documentId}
        documentName={documentName}
      />

      <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
        <DrawerContent className="mx-auto w-[100vw] max-w-[480px]">
          <DrawerHeader>
            <DrawerTitle>Document Options</DrawerTitle>
            <DrawerDescription className="sr-only">Choose an action for this document</DrawerDescription>
            <button className="button" onClick={handleUpload}>
              <img src={bookAddIcon} alt="Book with a plus icon" />
              Generate a lesson
            </button>
            <button>
              <img src={pdfIcon} alt="PDF icon" />
              Download to my device
            </button>
            <button onClick={handleShare}>
              <img src={uploadIcon} alt="Upload icon" />
              Share
            </button>
            <button onClick={handleDelete}>
              <img src={deleteIcon} alt="Trash can icon" />
              Delete
            </button>
          </DrawerHeader>
          <DrawerFooter>
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