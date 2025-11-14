import { useNavigate } from "react-router-dom";
import { useUnreadCount } from "../hooks/useNotifications";
import emptyBellIcon from "../assets/icons/emptyBell.svg";
// import solidBellIcon from "../assets/icons/notification.svg";
import "../styles/components/_notificationBell.scss";

export default function NotificationBell() {
  const navigate = useNavigate();
  const { data: unreadCount } = useUnreadCount();

  return (
    <button
      className="notification-bell"
      onClick={() => navigate("/notifications")}
      aria-label="Notifications"
    >
      <div className="notification-bell__wrapper">
        <img
          src={(unreadCount ?? 0) > 0 ? emptyBellIcon : emptyBellIcon}
          alt="Notifications"
          className="notification-bell__icon"
        />
        {(unreadCount ?? 0) > 0 && (
          <span className="notification-bell__badge">
            {(unreadCount ?? 0) > 99 ? '99+' : (unreadCount ?? 0)}
          </span>
        )}
      </div>
    </button>
  );
}
