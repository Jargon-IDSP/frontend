import type { Notification } from "./notification";

export interface ToastNotificationProps {
  notification: Notification;
  onClose: () => void;
  onRead: (id: string) => void;
}

export interface ToastContainerProps {
  toasts: Notification[];
  onClose: (id: string) => void;
  onRead: (id: string) => void;
}
