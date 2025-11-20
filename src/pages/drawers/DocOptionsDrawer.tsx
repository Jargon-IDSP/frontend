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
import { useAuth } from "@clerk/clerk-react";
import bookAddIcon from "@/assets/icons/bookAdd.svg";
import pdfIconDrawer from "@/assets/icons/pdfIcon-drawer.svg";
import shareIconDrawer from "@/assets/icons/shareIcon-drawer.svg";
import deleteIcon from "@/assets/icons/deleteIcon-brown.svg";
import DocumentDrawer from "./DocumentDrawer";
import DeleteDrawer from "./DeleteDrawer";
import ShareDrawer from "./ShareDrawer";
import type { DocOptionsDrawerProps } from "../../types/docOptionsDrawer";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function DocOptionsDrawer({
  open,
  onOpenChange,
  documentId,
  documentName,
  quizId,
}: DocOptionsDrawerProps) {
  const { getToken } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false);
  const [isShareDrawerOpen, setIsShareDrawerOpen] = useState(false);

  const handleUpload = () => {
    onOpenChange(false);
    setTimeout(() => {
      setIsDrawerOpen(true);
    }, 200);
  };

  const handleDownload = async () => {
    try {
      if (!documentId) {
        console.error("No document ID provided");
        return;
      }

      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/documents/${documentId}/download`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to get download URL");
      }

      const data = await response.json();

      // The backend returns { success: true, data: { downloadUrl: "..." } }
      if (data.success && data.data?.downloadUrl) {
        // Open the presigned URL in a new window for preview/download
        window.open(data.data.downloadUrl, "_blank");
        onOpenChange(false);
      } else {
        console.error("Invalid response format:", data);
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      alert("Failed to download document. Please try again.");
    }
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
            <DrawerDescription className="sr-only">
              Choose an action for this document
            </DrawerDescription>
            <button className="button-drawer" onClick={handleUpload}>
              <img src={bookAddIcon} alt="Book with a plus icon" />
              Generate a lesson
            </button>
            <button className="button-drawer" onClick={handleDownload}>
              <img src={pdfIconDrawer} alt="PDF icon" />
              Download to my device
            </button>
            <button className="button-drawer" onClick={handleShare}>
              <img src={shareIconDrawer} alt="Upload icon" />
              Share
            </button>
            <button className="button-drawer" onClick={handleDelete}>
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
