import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import type { DeleteDrawerProps } from "../../types/deleteDrawer";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function DeleteDrawer({
  open,
  onOpenChange,
  onCancel,
  documentId,
  documentName,
}: DeleteDrawerProps) {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!documentId) throw new Error("No document ID");
      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/documents/${documentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error("Failed to delete document");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["documentQuiz", documentId] });
      onOpenChange(false);
      navigate("/learning/custom");
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  const handleCancel = () => {
    onOpenChange(false);
    if (onCancel) {
      setTimeout(() => {
        onCancel();
      }, 200);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="mx-auto w-[100vw] max-w-[480px]">
        <DrawerHeader>
          <DrawerTitle>Delete Document</DrawerTitle>
          <DrawerDescription>
            Are you sure you want to delete "{documentName || "this document"}"?
            <br />
            <br />
            This will permanently remove the document and all associated study
            materials (flashcards, quizzes, etc.).
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-50"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
          <hr className="my-2 border-gray-200 mb-4" />
          <Button
            variant="outline"
            className="text-red-500 hover:bg-red-50"
            onClick={handleCancel}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
