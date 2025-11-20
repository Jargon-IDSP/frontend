import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import Modal from "./learning/ui/Modal";
import { BACKEND_URL } from "../lib/api";
import { useMarkAsRead } from "../hooks/useNotifications";
import type { LessonRequestModalProps } from "../types/lessonRequestModal";
import "../styles/components/_lessonRequestModal.scss";

export default function LessonRequestModal({
  isOpen,
  onClose,
  notificationId,
  requesterName,
  requesterId,
}: LessonRequestModalProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const markAsReadMutation = useMarkAsRead();
  const [isProcessing, setIsProcessing] = useState(false);

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/lesson-requests/accept`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requesterId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to accept lesson request");
      }

      return await res.json();
    },
    onSuccess: () => {
      // Mark notification as read
      markAsReadMutation.mutate(notificationId);
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["lessonRequests"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["lessonRequestStatus", requesterId] });
      setIsProcessing(false);
      onClose();
    },
    onError: (error: Error) => {
      alert(error.message);
      setIsProcessing(false);
    },
  });

  const denyMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/lesson-requests/deny`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requesterId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to deny lesson request");
      }

      return await res.json();
    },
    onSuccess: () => {
      // Mark notification as read
      markAsReadMutation.mutate(notificationId);
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["lessonRequests"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
      setIsProcessing(false);
      onClose();
    },
    onError: (error: Error) => {
      alert(error.message);
      setIsProcessing(false);
    },
  });

  const handleAccept = () => {
    setIsProcessing(true);
    acceptMutation.mutate();
  };

  const handleDeny = () => {
    setIsProcessing(true);
    denyMutation.mutate();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="400px">
      <div className="lesson-request-modal">
        <p className="lesson-request-modal__question">
          Allow {requesterName} to see all your current lessons?
        </p>
        <div className="lesson-request-modal__actions">
          <button
            className="lesson-request-modal__button lesson-request-modal__button--deny"
            onClick={handleDeny}
            disabled={isProcessing}
          >
            {denyMutation.isPending ? "Denying..." : "Deny"}
          </button>
          <button
            className="lesson-request-modal__button lesson-request-modal__button--allow"
            onClick={handleAccept}
            disabled={isProcessing}
          >
            {acceptMutation.isPending ? "Allowing..." : "Allow"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

