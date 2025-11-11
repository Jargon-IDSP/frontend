import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";
import { useNotificationContext } from "../contexts/NotificationContext";
import type { UseLessonRequestsOptions } from "../types/hooks";

/**
 * Shared hook for lesson request operations
 * Handles create, cancel, accept, and deny lesson requests
 */
export function useLessonRequests(options: UseLessonRequestsOptions = {}) {
  const { friendName } = options;
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useNotificationContext();

  // Create lesson request
  const createLessonRequestMutation = useMutation({
    mutationFn: async (recipientId: string) => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/lesson-requests`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipientId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to send lesson request");
      }

      return await res.json();
    },
    onSuccess: (_, recipientId) => {
      queryClient.invalidateQueries({ queryKey: ["lessonRequestStatus", recipientId] });
      queryClient.invalidateQueries({ queryKey: ["lessonRequests"] });
      showToast({
        id: `lesson-request-${Date.now()}`,
        type: "SUCCESS" as any,
        title: "Request Sent",
        message: `Lesson request sent to ${friendName || "user"}`,
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: "",
        actionUrl: undefined,
      });
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

  // Cancel lesson request
  const cancelLessonRequestMutation = useMutation({
    mutationFn: async (recipientId: string) => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/lesson-requests`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipientId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to cancel lesson request");
      }

      return await res.json();
    },
    onSuccess: (_, recipientId) => {
      queryClient.invalidateQueries({ queryKey: ["lessonRequestStatus", recipientId] });
      showToast({
        id: `cancel-request-${Date.now()}`,
        type: "SUCCESS" as any,
        title: "Request Cancelled",
        message: "Lesson request cancelled",
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: "",
        actionUrl: undefined,
      });
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

  // Accept lesson request
  const acceptLessonRequestMutation = useMutation({
    mutationFn: async (requesterId: string) => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/lesson-requests/accept`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requesterId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to accept lesson request");
      }

      return await res.json();
    },
    onSuccess: (_, requesterId) => {
      queryClient.invalidateQueries({ queryKey: ["lessonRequests"] });
      queryClient.invalidateQueries({ queryKey: ["lessonRequestStatus", requesterId] });
      queryClient.invalidateQueries({ queryKey: ["friendQuizzes", requesterId] });
      showToast({
        id: `accept-lesson-${Date.now()}`,
        type: "SUCCESS" as any,
        title: "Request Accepted",
        message: "Lesson access granted",
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: "",
        actionUrl: undefined,
      });
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

  // Deny lesson request
  const denyLessonRequestMutation = useMutation({
    mutationFn: async (requesterId: string) => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/lesson-requests/deny`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requesterId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to deny lesson request");
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessonRequests"] });
      showToast({
        id: `deny-lesson-${Date.now()}`,
        type: "SUCCESS" as any,
        title: "Request Denied",
        message: "Lesson request denied",
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: "",
        actionUrl: undefined,
      });
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
    createLessonRequestMutation,
    cancelLessonRequestMutation,
    acceptLessonRequestMutation,
    denyLessonRequestMutation,
  };
}
