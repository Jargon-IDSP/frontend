import { useState } from "react";
import { useProfile } from "../../hooks/useProfile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

type PrivacySetting = "PRIVATE" | "FRIENDS" | "PUBLIC";

interface PrivacySettingsProps {
  onClose: () => void;
}

export default function PrivacySettings({ onClose }: PrivacySettingsProps) {
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
      onClose();
    },
  });

  const handleSave = () => {
    updatePrivacyMutation.mutate(selectedPrivacy);
  };

  return (
    <div className="privacy-settings">
      <div className="privacy-settings-header">
        <h2 className="privacy-settings-title">Privacy Settings</h2>
        <button className="privacy-settings-close" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="privacy-settings-content">
        <p className="privacy-settings-description">
          Choose who can view your custom quizzes and documents by default.
        </p>

        <div className="privacy-settings-options">
          <label className="privacy-option">
            <input
              type="radio"
              name="privacy"
              value="PRIVATE"
              checked={selectedPrivacy === "PRIVATE"}
              onChange={(e) => setSelectedPrivacy(e.target.value as PrivacySetting)}
            />
            <div className="privacy-option-content">
              <h3 className="privacy-option-title">Private</h3>
              <p className="privacy-option-description">
                All documents and quizzes are private to only you. Sharing privileges are revoked.
              </p>
            </div>
          </label>

          <label className="privacy-option">
            <input
              type="radio"
              name="privacy"
              value="FRIENDS"
              checked={selectedPrivacy === "FRIENDS"}
              onChange={(e) => setSelectedPrivacy(e.target.value as PrivacySetting)}
            />
            <div className="privacy-option-content">
              <h3 className="privacy-option-title">Friends</h3>
              <p className="privacy-option-description">
                All friends can see all your custom uploads.
              </p>
            </div>
          </label>

          <label className="privacy-option">
            <input
              type="radio"
              name="privacy"
              value="PUBLIC"
              checked={selectedPrivacy === "PUBLIC"}
              onChange={(e) => setSelectedPrivacy(e.target.value as PrivacySetting)}
            />
            <div className="privacy-option-content">
              <h3 className="privacy-option-title">Everyone</h3>
              <p className="privacy-option-description">
                No restrictions - anyone can view your quizzes and documents.
              </p>
            </div>
          </label>
        </div>

        <div className="privacy-settings-actions">
          <button
            className="privacy-settings-button privacy-settings-button--cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="privacy-settings-button privacy-settings-button--save"
            onClick={handleSave}
            disabled={updatePrivacyMutation.isPending}
          >
            {updatePrivacyMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {updatePrivacyMutation.isError && (
          <p className="privacy-settings-error">
            Failed to update privacy settings. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
