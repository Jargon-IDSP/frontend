import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ToastContainer } from "@/components/ToastContainer";
import { useNotifications, useMarkAsRead } from "@/hooks/useNotifications";
import type { Notification } from "@/types/notification";
import type { NotificationContextType, NotificationProviderProps } from "@/types/notificationContext";

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [activeToasts, setActiveToasts] = useState<Notification[]>([]);
  const [shownNotificationIds, setShownNotificationIds] = useState<Set<string>>(new Set());

  const { data: notifications } = useNotifications();
  const markAsReadMutation = useMarkAsRead();

  // Debug logging
  useEffect(() => {
    console.log('Notifications updated:', notifications?.length || 0, notifications);
    console.log('Active toasts:', activeToasts.length);
    console.log('Shown notification IDs:', Array.from(shownNotificationIds));
  }, [notifications, activeToasts, shownNotificationIds]);

  // Show new unread notifications as toasts
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    setShownNotificationIds((prevShown) => {
      const newUnreadNotifications = notifications.filter(
        (notif) => !notif.isRead && !prevShown.has(notif.id)
      );

      if (newUnreadNotifications.length > 0) {
        // Show the most recent notification as a toast
        const latestNotification = newUnreadNotifications[0];

        console.log('Showing toast for notification:', latestNotification.title);

        setActiveToasts((prev) => {
          // Check if toast is already shown
          if (prev.some(t => t.id === latestNotification.id)) {
            return prev;
          }
          return [...prev, latestNotification];
        });

        // Add to shown set
        return new Set([...prevShown, latestNotification.id]);
      }

      // No changes, return same set
      return prevShown;
    });
  }, [notifications]);

  const showToast = useCallback((notification: Notification) => {
    setActiveToasts((prev) => [...prev, notification]);
  }, []);

  const showErrorToast = useCallback((message: string) => {
    const errorNotification: Notification = {
      id: `error-${Date.now()}`,
      type: "ERROR",
      title: "Upload Failed",
      message: message,
      isRead: false,
      createdAt: new Date().toISOString(),
      userId: "",
      actionUrl: undefined,
    };
    setActiveToasts((prev) => [...prev, errorNotification]);
  }, []);

  const hideToast = useCallback((id: string) => {
    setActiveToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const handleRead = useCallback(
    (id: string) => {
      markAsReadMutation.mutate(id);
    },
    [markAsReadMutation]
  );

  return (
    <NotificationContext.Provider value={{ showToast, showErrorToast, hideToast, activeToasts }}>
      {children}
      <ToastContainer toasts={activeToasts} onClose={hideToast} onRead={handleRead} />
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext must be used within NotificationProvider");
  }
  return context;
}
