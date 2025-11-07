import { useNavigate } from "react-router-dom";
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

export function NotificationsList() {
  const navigate = useNavigate();
  const { data: notifications, isLoading } = useNotifications();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }

    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleMarkAllAsRead = () => {
    console.log('Mark all as read clicked');
    markAllAsReadMutation.mutate(undefined, {
      onSuccess: (data) => {
        console.log('Mark all as read success:', data);
      },
      onError: (error) => {
        console.error('Mark all as read error:', error);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="notifications-list">
        <div className="notifications-list__header">
          <h3 className="notifications-list__title">Notifications</h3>
        </div>
        <div className="notifications-list__loading">Loading notifications...</div>
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="notifications-list">
        <div className="notifications-list__header">
          <h3 className="notifications-list__title">Notifications</h3>
        </div>
        <div className="notifications-list__empty">
          <p>No notifications yet</p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="notifications-list">
      <div className="notifications-list__header">
        <h3>
          Notifications
          {unreadCount > 0 && <span className="notifications-list__badge">{unreadCount}</span>}
        </h3>
        {unreadCount > 0 && (
          <button
            className="notifications-list__mark-all"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
          >
            {markAllAsReadMutation.isPending ? 'Marking...' : 'Mark all as read'}
          </button>
        )}
      </div>

      <div className="notifications-list__items">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notifications-list__item ${!notification.isRead ? "unread" : ""}`}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="notifications-list__item-content">
              <div className="notifications-list__item-title">{notification.title}</div>
              <div className="notifications-list__item-message">{notification.message}</div>
              <div className="notifications-list__item-time">
                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
              </div>
            </div>
            {!notification.isRead && <div className="notifications-list__item-dot"></div>}
          </div>
        ))}
      </div>
    </div>
  );
}
