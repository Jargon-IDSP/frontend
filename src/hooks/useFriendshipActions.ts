import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../lib/api";
import { useNotificationContext } from "../contexts/NotificationContext";
import type { UseFriendshipActionsOptions } from "../types/hooks";

/**
 * Shared hook for all friendship-related actions (follow, unfollow, etc.)
 * Consolidates duplicate mutation logic from FriendsPage and FriendProfilePage
 */
export function useFriendshipActions(options: UseFriendshipActionsOptions = {}) {
  const { friendId, friendName, navigateOnRemove = false, skipFollowToast = false } = options;
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useNotificationContext();
  const navigate = useNavigate();

  // Send friend request (follow someone)
  const sendRequestMutation = useMutation({
    mutationFn: async (addresseeId: string) => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/friendships`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ addresseeId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to send friend request");
      }

      return await res.json();
    },
    onSuccess: async (_, addresseeId) => {
      // Invalidate all relevant queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["friendshipStatus", addresseeId] }),
        queryClient.invalidateQueries({ queryKey: ["friends"] }),
        queryClient.invalidateQueries({ queryKey: ["followers"] }),
        queryClient.invalidateQueries({ queryKey: ["following"] }),
        queryClient.invalidateQueries({ queryKey: ["lessonRequestStatus", addresseeId] }),
      ]);

      // Only show toast if not skipped (allows custom toast from calling component)
      if (!skipFollowToast) {
        showToast({
          id: `follow-${Date.now()}`,
          type: "SUCCESS" as any,
          title: "Success",
          message: `You are now following ${friendName || "this user"}`,
          isRead: false,
          createdAt: new Date().toISOString(),
          userId: "",
          actionUrl: undefined,
        });
      }
    },
    onError: (err: Error) => {
      showToast({
        id: `error-${Date.now()}`,
        type: "ERROR" as any,
        title: "Error",
        message: err.message,
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: "",
        actionUrl: undefined,
      });
    },
  });

  // Remove friend (unfollow someone)
  const removeFriendMutation = useMutation({
    mutationFn: async (friendshipId: string) => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/friendships/${friendshipId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to unfollow friend");
      }

      return await res.json();
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["friendshipStatus", friendId] }),
        queryClient.invalidateQueries({ queryKey: ["friends"] }),
        queryClient.invalidateQueries({ queryKey: ["followers"] }),
        queryClient.invalidateQueries({ queryKey: ["following"] }),
      ]);

      showToast({
        id: `unfollow-${Date.now()}`,
        type: "SUCCESS" as any,
        title: "Success",
        message: `You have unfollowed ${friendName || "this user"}`,
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: "",
        actionUrl: undefined,
      });

      if (navigateOnRemove) {
        navigate("/profile/friends");
      }
    },
    onError: (err: Error) => {
      showToast({
        id: `error-${Date.now()}`,
        type: "ERROR" as any,
        title: "Error",
        message: err.message,
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: "",
        actionUrl: undefined,
      });
    },
  });

  return {
    sendRequestMutation,
    removeFriendMutation,
  };
}
