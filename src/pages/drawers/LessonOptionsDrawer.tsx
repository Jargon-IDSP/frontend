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
import editNameIcon from "@/assets/icons/editNameIcon.svg";
import addToFolderIcon from "@/assets/icons/addToFolderIcon.svg";
import shareIconDrawer from "@/assets/icons/shareIcon-drawer.svg";
import deleteIcon from "@/assets/icons/deleteIcon-brown.svg";
import type { LessonOptionsDrawerProps } from "../../types/lessonOptionsDrawer";
import DocumentDrawer from "./DocumentDrawer";
import DeleteDrawer from "./DeleteDrawer";
import AddToFolderDrawer from "./AddToFolderDrawer";
import ShareDrawer from "./ShareDrawer";
import EditNameDrawer from "./EditNameDrawer";

export default function LessonOptionsDrawer({
  open,
  onOpenChange,
  quizId,
  documentId,
  documentName,
}: LessonOptionsDrawerProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddToFolderDrawerOpen, setIsAddToFolderDrawerOpen] = useState(false);
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false);
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false);
  const [isEditNameDrawerOpen, setIsEditNameDrawerOpen] = useState(false);

  const handleEditName = () => {
    onOpenChange(false);
    setTimeout(() => {
      setIsEditNameDrawerOpen(true);
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

  const handleShare = () => {
    onOpenChange(false);
    setTimeout(() => {
      setIsShareDrawerOpen(true);
    }, 200);
  };

  return (
    <>
      <DocumentDrawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen} />
      <AddToFolderDrawer
        open={isAddToFolderDrawerOpen}
        onOpenChange={setIsAddToFolderDrawerOpen}
        onCancel={handleAddToFolderCancel}
        documentId={documentId}
      />
      <DeleteDrawer
        open={isDeleteDrawerOpen}
        onOpenChange={setIsDeleteDrawerOpen}
        onCancel={handleDeleteCancel}
        documentId={documentId}
        documentName={documentName}
      />
      <ShareDrawer
        open={isShareDrawerOpen}
        onOpenChange={setIsShareDrawerOpen}
        quizId={quizId}
      />
      <EditNameDrawer
        open={isEditNameDrawerOpen}
        onOpenChange={setIsEditNameDrawerOpen}
        documentId={documentId}
        currentName={documentName}
      />

      <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
        <DrawerContent className="mx-auto w-[100vw] max-w-[480px]">
          <DrawerHeader>
            <DrawerTitle>Lesson Options</DrawerTitle>
            <DrawerDescription className="sr-only">
              Choose an action for this lesson
            </DrawerDescription>
            <button className="button-drawer" onClick={handleEditName}>
              <img
                className="button-img-drawer"
                src={editNameIcon}
                alt="A book and a pen icon"
              />
              Edit document name
            </button>
            <button className="button-drawer" onClick={handleAddToFolder}>
              <img
                className="button-img-drawer"
                src={addToFolderIcon}
                alt="A folder with a upload symbol icon"
              />
              Add to folder
            </button>
            <button className="button-drawer" onClick={handleShare}>
              <img
                className="button-img-drawer"
                src={shareIconDrawer}
                alt="Upload icon"
              />
              Share
            </button>
            <button className="button-drawer" onClick={handleDelete}>
              <img
                className="button-img-drawer"
                src={deleteIcon}
                alt="Trash can icon"
              />
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
