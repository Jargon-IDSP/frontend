import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import type { EditNameDrawerProps } from "../../types/editNameDrawer";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function EditNameDrawer({
  open,
  onOpenChange,
  documentId,
  currentName,
}: EditNameDrawerProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState(currentName);
  const [error, setError] = useState("");

  const updateNameMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!documentId) throw new Error("No document ID");
      if (!name.trim()) throw new Error("Name cannot be empty");

      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/documents/${documentId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to update document name");
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all document-related queries
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      queryClient.invalidateQueries({
        queryKey: ["documentQuizzes", documentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["documentTranslation", documentId],
      });

      // Invalidate profile queries (shows user's documents)
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      // Invalidate friend lesson queries (in case viewing as friend)
      queryClient.invalidateQueries({ queryKey: ["friendLessons"] });

      // Invalidate any quiz-related queries that might show document name
      queryClient.invalidateQueries({ queryKey: ["customQuizzes"] });

      setError("");
      onOpenChange(false);

      // Refresh the page to show updated document name
      window.location.reload();
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSave = () => {
    if (!newName.trim()) {
      setError("Document name cannot be empty");
      return;
    }
    updateNameMutation.mutate(newName);
  };

  const handleCancel = () => {
    setNewName(currentName);
    setError("");
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="mx-auto w-[100vw] max-w-[480px]">
        <DrawerHeader>
          <DrawerTitle>Edit Document Name</DrawerTitle>
          <DrawerDescription>
            Enter a new name for your document
          </DrawerDescription>

          <div className="edit-name-drawer-content">
            <input
              type="text"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setError("");
              }}
              placeholder="Document name"
              className="edit-name-drawer-input"
              disabled={updateNameMutation.isPending}
              autoFocus
            />
            {error && <p className="edit-name-drawer-error">{error}</p>}
          </div>
        </DrawerHeader>

        <DrawerFooter>
          <Button
            onClick={handleSave}
            disabled={updateNameMutation.isPending || !newName.trim()}
            className="w-full"
          >
            {updateNameMutation.isPending ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={updateNameMutation.isPending}
            className="w-full"
          >
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
