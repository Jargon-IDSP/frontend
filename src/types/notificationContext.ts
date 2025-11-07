import type { Notification } from "./notification";

export interface NotificationContextType {
  showToast: (notification: Notification) => void;
  showErrorToast: (message: string) => void;
  hideToast: (id: string) => void;
  activeToasts: Notification[];
}

export interface NotificationProviderProps {
  children: React.ReactNode;
}
