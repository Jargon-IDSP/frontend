import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { ToastNotificationProps } from "@/types/toastNotification";

export function ToastNotification({ notification, onClose, onRead }: ToastNotificationProps) {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClick = () => {
    // Mark as read
    onRead(notification.id);

    // Navigate if there's an action URL
    if (notification.actionUrl) {
      // Fix LESSON_APPROVED notifications to use /profile/friends/ instead of /profile/
      let url = notification.actionUrl;
      if (notification.type === "LESSON_APPROVED" && url.startsWith("/profile/") && !url.startsWith("/profile/friends/")) {
        // Extract userId from /profile/userId and convert to /profile/friends/userId
        const userId = url.replace("/profile/", "");
        url = `/profile/friends/${userId}`;
      }
      navigate(url);
    }

    // Close the toast
    onClose();
  };

  return (
    <div
      className="toast-notification"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
    >
      <div className="toast-notification__content">
        <div className="toast-notification__title">{notification.title}</div>
        <div className="toast-notification__message">{notification.message}</div>
      </div>
      <button
        className="toast-notification__close"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
}
