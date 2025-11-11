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
import { useProfile } from "../../hooks/useProfile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

type PrivacySetting = "PRIVATE" | "FRIENDS" | "PUBLIC";

interface PrivacyDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PrivacyDrawer({
  open,
  onOpenChange,
}: PrivacyDrawerProps) {
  const { data: profile } = useProfile();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const [selectedPrivacy, setSelectedPrivacy] = useState<PrivacySetting>(
    (profile?.defaultPrivacy as PrivacySetting) || "PRIVATE"
  );

  const updatePrivacyMutation = useMutation({
    mutationFn: async (privacy: PrivacySetting) => {
      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/api/users/privacy`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ defaultPrivacy: privacy }),
      });

      if (!response.ok) {
        throw new Error("Failed to update privacy settings");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      onOpenChange(false);
    },
  });

  const handleSave = () => {
    updatePrivacyMutation.mutate(selectedPrivacy);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="mx-auto w-[100vw] max-w-[480px]">
        <DrawerHeader>
          <DrawerTitle>Privacy Settings</DrawerTitle>
          <DrawerDescription>
            Choose who can view your custom quizzes and documents by default.
          </DrawerDescription>
        </DrawerHeader>

        <div className="privacy-drawer-options">
          <label className="privacy-drawer-option">
            <input
              type="radio"
              name="privacy"
              value="PRIVATE"
              checked={selectedPrivacy === "PRIVATE"}
              onChange={(e) =>
                setSelectedPrivacy(e.target.value as PrivacySetting)
              }
            />
            <div className="privacy-drawer-option-content">
              <h3>Private</h3>
              <p>
                By default, documents are only visible to you. Individual friends can request to see your documents, which you can choose to approve.
              </p>
            </div>
          </label>

          <label className="privacy-drawer-option">
            <input
              type="radio"
              name="privacy"
              value="FRIENDS"
              checked={selectedPrivacy === "FRIENDS"}
              onChange={(e) =>
                setSelectedPrivacy(e.target.value as PrivacySetting)
              }
            />
            <div className="privacy-drawer-option-content">
              <h3>Friends</h3>
              <p>All friends can see all your custom uploads.</p>
            </div>
          </label>

          <label className="privacy-drawer-option">
            <input
              type="radio"
              name="privacy"
              value="PUBLIC"
              checked={selectedPrivacy === "PUBLIC"}
              onChange={(e) =>
                setSelectedPrivacy(e.target.value as PrivacySetting)
              }
            />
            <div className="privacy-drawer-option-content">
              <h3>Everyone</h3>
              <p>No restrictions - anyone can view your quizzes and documents.</p>
            </div>
          </label>
        </div>

        {updatePrivacyMutation.isError && (
          <p className="privacy-drawer-error">
            Failed to update privacy settings. Please try again.
          </p>
        )}

        <DrawerFooter>
          <Button
            onClick={handleSave}
            disabled={updatePrivacyMutation.isPending}
            className="w-full"
          >
            {updatePrivacyMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
          <hr className="my-1 border-gray-200" />
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
