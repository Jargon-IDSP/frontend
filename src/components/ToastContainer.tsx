import { ToastNotification } from "./ToastNotification";
import type { ToastContainerProps } from "@/types/toastNotification";

export function ToastContainer({ toasts, onClose, onRead }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          notification={toast}
          onClose={() => onClose(toast.id)}
          onRead={onRead}
        />
      ))}
    </div>
  );
}
