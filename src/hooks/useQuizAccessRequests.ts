import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";
import { useNotificationContext } from "../contexts/NotificationContext";
import type { UseQuizAccessRequestsOptions } from "../types/hooks";

/**
 * Shared hook for quiz access request operations
 * Handles request, approve, and deny quiz access
 */
export function useQuizAccessRequests(options: UseQuizAccessRequestsOptions = {}) {
  const { friendId, friendName } = options;
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useNotificationContext();

  // Request quiz access mutation
  const requestQuizAccessMutation = useMutation({
    mutationFn: async (quizId: string) => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/quiz-shares/request-access`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customQuizId: quizId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to request quiz access");
      }

      return await res.json();
    },
    onMutate: async (quizId: string) => {
      if (!friendId) return {};

      await queryClient.cancelQueries({ queryKey: ["myRequests", friendId] });
      const previousRequests = queryClient.getQueryData(["myRequests", friendId]);

      queryClient.setQueryData(["myRequests", friendId], (old: any) => {
        if (!old) return [quizId];
        return [...old, quizId];
      });

      return { previousRequests };
    },
    onSuccess: () => {
      if (friendId) {
        queryClient.invalidateQueries({ queryKey: ["friendQuizzes", friendId] });
        queryClient.invalidateQueries({ queryKey: ["myRequests", friendId] });
      }
      showToast({
        id: `quiz-access-request-${Date.now()}`,
        type: "SUCCESS" as any,
        title: "Request Sent",
        message: `Access request sent to ${friendName || "user"}`,
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: "",
        actionUrl: undefined,
      });
    },
    onError: (err: Error, quizId: string, context: any) => {
      if (context?.previousRequests && friendId) {
        queryClient.setQueryData(["myRequests", friendId], context.previousRequests);
      }
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

  // Approve quiz access request mutation
  const approveQuizAccessMutation = useMutation({
    mutationFn: async (quizId: string) => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/quiz-shares`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customQuizId: quizId,
          friendUserId: friendId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to approve request");
      }

      return await res.json();
    },
    onMutate: async (quizId: string) => {
      if (!friendId) return {};

      await queryClient.cancelQueries({ queryKey: ["pendingRequests", friendId] });
      await queryClient.cancelQueries({ queryKey: ["myRequests", friendId] });

      const previousRequests = queryClient.getQueryData(["pendingRequests", friendId]);
      const previousMyRequests = queryClient.getQueryData(["myRequests", friendId]);

      queryClient.setQueryData(["pendingRequests", friendId], (old: any) => {
        if (!old) return [];
        return old.filter((req: any) => req.quizId !== quizId);
      });

      queryClient.setQueryData(["myRequests", friendId], (old: any) => {
        if (!old) return [];
        return old.filter((id: string) => id !== quizId);
      });

      return { previousRequests, previousMyRequests };
    },
    onSuccess: () => {
      if (friendId) {
        queryClient.invalidateQueries({ queryKey: ["pendingRequests", friendId] });
        queryClient.invalidateQueries({ queryKey: ["friendQuizzes", friendId] });
        queryClient.invalidateQueries({ queryKey: ["myRequests", friendId] });
      }
      showToast({
        id: `approve-${Date.now()}`,
        type: "SUCCESS" as any,
        title: "Access Granted",
        message: `${friendName || "User"} now has access to the lesson`,
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: "",
        actionUrl: undefined,
      });
    },
    onError: (err: Error, quizId: string, context: any) => {
      if (context?.previousRequests && friendId) {
        queryClient.setQueryData(["pendingRequests", friendId], context.previousRequests);
      }
      if (context?.previousMyRequests && friendId) {
        queryClient.setQueryData(["myRequests", friendId], context.previousMyRequests);
      }
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

  // Deny quiz access request mutation
  const denyQuizAccessMutation = useMutation({
    mutationFn: async (quizId: string) => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/quiz-shares/deny-access`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customQuizId: quizId,
          requesterId: friendId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to deny request");
      }

      return await res.json();
    },
    onMutate: async (quizId: string) => {
      if (!friendId) return {};

      await queryClient.cancelQueries({ queryKey: ["pendingRequests", friendId] });

      const previousRequests = queryClient.getQueryData(["pendingRequests", friendId]);

      queryClient.setQueryData(["pendingRequests", friendId], (old: any) => {
        if (!old) return [];
        return old.filter((req: any) => req.quizId !== quizId);
      });

      return { previousRequests };
    },
    onSuccess: () => {
      if (friendId) {
        queryClient.invalidateQueries({ queryKey: ["pendingRequests", friendId] });
      }
      showToast({
        id: `deny-${Date.now()}`,
        type: "SUCCESS" as any,
        title: "Request Denied",
        message: "Access request denied",
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: "",
        actionUrl: undefined,
      });
    },
    onError: (err: Error, quizId: string, context: any) => {
      if (context?.previousRequests && friendId) {
        queryClient.setQueryData(["pendingRequests", friendId], context.previousRequests);
      }
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
    requestQuizAccessMutation,
    approveQuizAccessMutation,
    denyQuizAccessMutation,
  };
}
