import { useState, useEffect } from "react";
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

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

interface EditSocialMediaDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: "linkedin" | "facebook" | "instagram" | "indeed";
  currentUrl?: string;
}

const platformLabels = {
  linkedin: "LinkedIn",
  facebook: "Facebook",
  instagram: "Instagram",
  indeed: "Indeed",
};

const platformFields = {
  linkedin: "linkedinUrl",
  facebook: "facebookUrl",
  instagram: "instagramUrl",
  indeed: "indeedUrl",
};

export default function EditSocialMediaDrawer({
  open,
  onOpenChange,
  platform,
  currentUrl = "",
}: EditSocialMediaDrawerProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [newUrl, setNewUrl] = useState(currentUrl);
  const [error, setError] = useState("");

  // Sync newUrl state with currentUrl prop when drawer opens or platform changes
  useEffect(() => {
    setNewUrl(currentUrl);
  }, [currentUrl, open]);

  const updateSocialMediaMutation = useMutation({
    mutationFn: async (url: string) => {
      const token = await getToken();
      const fieldName = platformFields[platform];

      const response = await fetch(`${BACKEND_URL}/profile/social-media`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ [fieldName]: url.trim() || null }),
      });

      if (!response.ok) {
        throw new Error("Failed to update social media link");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["friendProfile"] });

      setError("");
      onOpenChange(false);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSave = () => {
    updateSocialMediaMutation.mutate(newUrl);
  };

  const handleCancel = () => {
    setNewUrl(currentUrl);
    setError("");
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="mx-auto w-[100vw] max-w-[480px]">
        <DrawerHeader>
          <DrawerTitle>Edit {platformLabels[platform]} Link</DrawerTitle>
          <DrawerDescription>
            Enter the URL to your {platformLabels[platform]} profile
          </DrawerDescription>

          <div className="edit-name-drawer-content">
            <input
              type="url"
              value={newUrl}
              onChange={(e) => {
                setNewUrl(e.target.value);
                setError("");
              }}
              placeholder={`https://${platform}.com/yourprofile`}
              className="edit-name-drawer-input"
              disabled={updateSocialMediaMutation.isPending}
              autoFocus
            />
            {error && <p className="edit-name-drawer-error">{error}</p>}
          </div>
        </DrawerHeader>

        <DrawerFooter>
          <Button
            onClick={handleSave}
            disabled={updateSocialMediaMutation.isPending}
            className="w-full"
          >
            {updateSocialMediaMutation.isPending ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={updateSocialMediaMutation.isPending}
            className="w-full"
          >
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
