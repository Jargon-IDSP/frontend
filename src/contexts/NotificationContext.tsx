import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ToastContainer } from "@/components/ToastContainer";
import { useNotifications, useMarkAsRead } from "@/hooks/useNotifications";
import type { Notification } from "@/types/notification";
import type { NotificationContextType, NotificationProviderProps } from "@/types/notificationContext";

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [activeToasts, setActiveToasts] = useState<Notification[]>([]);
  const [shownNotificationIds, setShownNotificationIds] = useState<Set<string>>(() => {
    // Initialize from localStorage to persist across page reloads
    const stored = localStorage.getItem('shownNotificationIds');
    if (stored) {
      try {
        return new Set(JSON.parse(stored));
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  const { data: notifications } = useNotifications();
  const markAsReadMutation = useMarkAsRead();

  // Persist shownNotificationIds to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shownNotificationIds', JSON.stringify(Array.from(shownNotificationIds)));
  }, [shownNotificationIds]);

  // Handle notifications: cleanup old IDs and show new toasts
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    const currentNotificationIds = new Set(notifications.map(n => n.id));

    setShownNotificationIds((prevShown) => {
      // First, clean up IDs that are no longer in the notifications list
      const cleanedIds = new Set(
        Array.from(prevShown).filter(id => currentNotificationIds.has(id))
      );

      // Find new unread notifications that haven't been shown
      const newUnreadNotifications = notifications.filter(
        (notif) => !notif.isRead && !cleanedIds.has(notif.id)
      );

      if (newUnreadNotifications.length > 0) {
        // Show the most recent notification as a toast
        const latestNotification = newUnreadNotifications[0];

        setActiveToasts((prev) => {
          // Check if toast is already shown
          if (prev.some(t => t.id === latestNotification.id)) {
            return prev;
          }
          return [...prev, latestNotification];
        });

        // Add to shown set
        return new Set([...cleanedIds, latestNotification.id]);
      }

      // If we cleaned up some IDs, return the cleaned set
      if (cleanedIds.size !== prevShown.size) {
        return cleanedIds;
      }

      // No changes, return same set reference
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
