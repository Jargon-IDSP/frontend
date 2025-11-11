import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useClearAllNotifications, useDeleteNotification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { BACKEND_URL } from "@/lib/api";
import LessonRequestModal from "./LessonRequestModal";

export function NotificationsList() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { data: notifications, isLoading } = useNotifications();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const clearAllMutation = useClearAllNotifications();
  const deleteNotificationMutation = useDeleteNotification();
  const [selectedNotification, setSelectedNotification] = useState<{
    id: string;
    lessonRequestId: string;
  } | null>(null);

  const { data: lessonRequest } = useQuery({
    queryKey: ["lessonRequest", selectedNotification?.lessonRequestId],
    queryFn: async () => {
      if (!selectedNotification?.lessonRequestId) return null;
      const token = await getToken();
      const res = await fetch(
        `${BACKEND_URL}/lesson-requests/${selectedNotification.lessonRequestId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch lesson request");
      const data = await res.json();
      return data.data;
    },
    enabled: !!selectedNotification?.lessonRequestId,
  });

  useEffect(() => {
    if (selectedNotification && lessonRequest && lessonRequest.status !== "PENDING") {
      const notification = notifications?.find(n => n.id === selectedNotification.id);
      if (notification) {
        if (!notification.isRead) {
          markAsReadMutation.mutate(notification.id);
        }
        if (notification.actionUrl) {
          navigate(notification.actionUrl);
        }
      }
      setSelectedNotification(null);
    }
  }, [selectedNotification, lessonRequest, notifications, navigate, markAsReadMutation]);

  const handleNotificationClick = (notification: any) => {
    if (notification.title === "New Lesson Request" && notification.lessonRequestId) {
      setSelectedNotification({
        id: notification.id,
        lessonRequestId: notification.lessonRequestId,
      });
      return;
    }

    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }

    if (notification.actionUrl) {
      let url = notification.actionUrl;
      if (notification.type === "LESSON_APPROVED" && url.startsWith("/profile/") && !url.startsWith("/profile/friends/")) {
        const userId = url.replace("/profile/", "");
        url = `/profile/friends/${userId}`;
      }
      navigate(url);
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

  const handleClearAll = () => {
    console.log('Clear all notifications clicked');
    clearAllMutation.mutate(undefined, {
      onSuccess: (data) => {
        console.log('Clear all success:', data);
      },
      onError: (error) => {
        console.error('Clear all error:', error);
      },
    });
  };

  const handleDeleteNotification = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation(); // Prevent notification click handler
    deleteNotificationMutation.mutate(notificationId);
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
        <div className="notifications-list__actions">
          {unreadCount > 0 && (
            <button
              className="notifications-list__mark-all"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
            >
              {markAllAsReadMutation.isPending ? 'Marking...' : 'Mark all as read'}
            </button>
          )}
          {notifications.length > 0 && (
            <button
              className="notifications-list__clear-all"
              onClick={handleClearAll}
              disabled={clearAllMutation.isPending}
            >
              {clearAllMutation.isPending ? 'Clearing...' : 'Clear all'}
            </button>
          )}
        </div>
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
            <div className="notifications-list__item-actions">
              {!notification.isRead && <div className="notifications-list__item-dot"></div>}
              <button
                className="notifications-list__item-delete"
                onClick={(e) => handleDeleteNotification(e, notification.id)}
                aria-label="Delete notification"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedNotification && lessonRequest && lessonRequest.status === "PENDING" && (
        <LessonRequestModal
          isOpen={!!selectedNotification}
          onClose={() => setSelectedNotification(null)}
          notificationId={selectedNotification.id}
          requesterName={
            lessonRequest.requester.firstName && lessonRequest.requester.lastName
              ? `${lessonRequest.requester.firstName} ${lessonRequest.requester.lastName}`
              : lessonRequest.requester.firstName || 
                lessonRequest.requester.lastName || 
                lessonRequest.requester.username || 
                "Someone"
          }
          requesterId={lessonRequest.requester.id}
        />
      )}
    </div>
  );
}
