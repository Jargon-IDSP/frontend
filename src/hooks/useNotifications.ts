import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "@/lib/api";
import type { Notification, NotificationResponse, UnreadCountResponse } from "@/types/notification";

export function useNotifications() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["notifications"],
    queryFn: async (): Promise<Notification[]> => {
      const token = await getToken();
      if (!token) {
        return [];
      }

      const response = await fetch(`${BACKEND_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }

      const data: NotificationResponse = await response.json();
      return data.data;
    },
    enabled: !!isSignedIn, // Only run query if user is signed in
    staleTime: 0, // Always consider data stale for immediate updates
    refetchInterval: isSignedIn ? 2 * 1000 : false, // Poll every 2 seconds for faster notification delivery
  });
}

export function useUnreadCount() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async (): Promise<number> => {
      const token = await getToken();
      if (!token) {
        return 0;
      }

      const response = await fetch(`${BACKEND_URL}/notifications/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch unread count");
      }

      const data: UnreadCountResponse = await response.json();
      return data.data.count;
    },
    enabled: !!isSignedIn, // Only run query if user is signed in
    staleTime: 0, // Always consider data stale for immediate updates
    refetchInterval: isSignedIn ? 2 * 1000 : false, // Poll every 2 seconds for faster notification delivery
  });
}

export function useMarkAsRead() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to mark notification as read");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
}

export function useMarkAllAsRead() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/notifications/read-all`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
}

export function useDeleteNotification() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete notification");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
}
