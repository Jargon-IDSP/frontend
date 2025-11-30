import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import {
    useNotifications,
    useMarkAsRead,
    useMarkAllAsRead,
    useClearAllNotifications,
    useDeleteNotification,
} from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { BACKEND_URL } from "@/lib/api";
import LessonRequestModal from "./LessonRequestModal";
import HappyRocky from "./avatar/rocky/HappyRocky";
import communityIcon from "@/assets/icons/navbar/bold/communityIconBold.svg";
import courseIcon from "@/assets/icons/navbar/bold/courseIconB.svg";
import type { Notification } from "@/types/notification";

function getNotificationIcon(
    notification: Notification
): "community" | "course" | "default" {
    // Community-related notifications
    if (
        notification.type === "FRIEND_REQUEST" ||
        notification.followId ||
        notification.actionUrl?.includes("/profile/friends") ||
        notification.actionUrl?.includes("/community")
    ) {
        return "community";
    }

    // Course/lesson-related notifications
    if (
        notification.type === "LESSON_APPROVED" ||
        notification.type === "QUIZ_SHARED" ||
        notification.lessonRequestId ||
        notification.documentId ||
        notification.actionUrl?.includes("/learning") ||
        notification.actionUrl?.includes("/documents")
    ) {
        return "course";
    }

    // Default to Rocky for other notifications
    return "default";
}

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
    const [visibleCount, setVisibleCount] = useState(4);

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
        if (
            selectedNotification &&
            lessonRequest &&
            lessonRequest.status !== "PENDING"
        ) {
            const notification = notifications?.find(
                (n) => n.id === selectedNotification.id
            );
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
    }, [
        selectedNotification,
        lessonRequest,
        notifications,
        navigate,
        markAsReadMutation,
    ]);

    const handleNotificationClick = (notification: any) => {
        if (
            notification.title === "New Lesson Request" &&
            notification.lessonRequestId
        ) {
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
            if (
                notification.type === "LESSON_APPROVED" &&
                url.startsWith("/profile/") &&
                !url.startsWith("/profile/friends/")
            ) {
                const userId = url.replace("/profile/", "");
                url = `/profile/friends/${userId}`;
            }
            navigate(url);
        }
    };

    const handleMarkAllAsRead = () => {
        console.log("Mark all as read clicked");
        markAllAsReadMutation.mutate(undefined, {
            onSuccess: (data) => {
                console.log("Mark all as read success:", data);
            },
            onError: (error) => {
                console.error("Mark all as read error:", error);
            },
        });
    };

    const handleClearAll = () => {
        console.log("Clear all notifications clicked");
        clearAllMutation.mutate(undefined, {
            onSuccess: (data) => {
                console.log("Clear all success:", data);
            },
            onError: (error) => {
                console.error("Clear all error:", error);
            },
        });
    };

    const handleDeleteNotification = (
        e: React.MouseEvent,
        notificationId: string
    ) => {
        e.stopPropagation(); // Prevent notification click handler
        deleteNotificationMutation.mutate(notificationId);
    };

    const renderEmptyState = (message: string) => (
        <div className='notifications-list'>
            <div className='notifications-list__placeholder'>
                <p>{message}</p>
            </div>
        </div>
    );

    if (isLoading) {
        return renderEmptyState("Loading notifications...");
    }

    if (!notifications || notifications.length === 0) {
        return renderEmptyState("No notifications yet");
    }

    const unreadCount = notifications.filter((n) => !n.isRead).length;
    const displayedNotifications = notifications.slice(0, visibleCount);
    const hasMore = notifications.length > visibleCount;

    return (
        <div className='notifications-list'>
            {(unreadCount > 0 || notifications.length > 0) && (
                <div className='notifications-list__actions'>
                    {unreadCount > 0 && (
                        <button
                            className='notifications-list__pill-button'
                            onClick={handleMarkAllAsRead}
                            disabled={markAllAsReadMutation.isPending}
                            type='button'>
                            {markAllAsReadMutation.isPending
                                ? "Marking..."
                                : `Mark all (${unreadCount})`}
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button
                            className='notifications-list__pill-button notifications-list__pill-button--danger'
                            onClick={handleClearAll}
                            disabled={clearAllMutation.isPending}
                            type='button'>
                            {clearAllMutation.isPending
                                ? "Clearing..."
                                : "Clear all"}
                        </button>
                    )}
                </div>
            )}

            <div className='notifications-list__items'>
                {displayedNotifications.map((notification) => {
                    const displayTitle = notification.title || "Notification";
                    const displayMessage =
                        notification.message ||
                        (notification as { body?: string }).body ||
                        "You have a new update.";

                    const iconType = getNotificationIcon(notification);

                    return (
                        <div
                            key={notification.id}
                            className={`notifications-list__item ${
                                !notification.isRead ? "unread" : ""
                            }`}
                            onClick={() =>
                                handleNotificationClick(notification)
                            }>
                            <div
                                className='notifications-list__avatar'
                                aria-hidden='true'>
                                {iconType === "community" ? (
                                    <img
                                        src={communityIcon}
                                        alt='Community'
                                        className='notifications-list__icon'
                                    />
                                ) : iconType === "course" ? (
                                    <img
                                        src={courseIcon}
                                        alt='Course'
                                        className='notifications-list__icon'
                                    />
                                ) : (
                                    <HappyRocky />
                                )}
                            </div>
                            <div className='notifications-list__item-content'>
                                <p className='notifications-list__message'>
                                    {displayMessage.length > 30 ? `${displayMessage.slice(0, 30)}...` : displayMessage}
                                </p>
                                <span className='notifications-list__item-time'>
                                    {formatDistanceToNow(
                                        new Date(notification.createdAt),
                                        { addSuffix: true }
                                    )}
                                </span>
                            </div>
                            <button
                                className='notifications-list__item-delete'
                                onClick={(e) =>
                                    handleDeleteNotification(e, notification.id)
                                }
                                aria-label={`Delete notification from ${displayTitle}`}
                                type='button'>
                                <span aria-hidden='true'>−</span>
                                <span className='notifications-list__sr-only'>
                                    Remove notification
                                </span>
                            </button>
                        </div>
                    );
                })}
            </div>

            {hasMore && (
                <button
                    className="notifications-list__view-more"
                    onClick={() => setVisibleCount(prev => Math.min(prev + 4, notifications.length))}
                    type="button"
                >
                    View More ({notifications.length - visibleCount} remaining)
                </button>
            )}

            {selectedNotification &&
                lessonRequest &&
                lessonRequest.status === "PENDING" && (
                    <LessonRequestModal
                        isOpen={!!selectedNotification}
                        onClose={() => setSelectedNotification(null)}
                        notificationId={selectedNotification.id}
                        requesterName={
                            lessonRequest.requester.firstName &&
                            lessonRequest.requester.lastName
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
