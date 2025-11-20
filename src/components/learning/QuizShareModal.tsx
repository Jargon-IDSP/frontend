import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BACKEND_URL } from "../../lib/api";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import LoadingBar from "../LoadingBar";
import { getUserDisplayName } from "../../types/friend";
import type { Friend } from "../../types/friend";
import type { QuizShareModalProps } from "@/types/components/quiz";
import type { FriendsResponse } from "@/types/api/friends";
import "../../styles/components/_quizShareModal.scss";

export default function QuizShareModal({
  quizId,
  quizName,
  onClose,
  onShared,
}: QuizShareModalProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());

  // Fetch quiz data to get visibility
  const { data: quizData } = useQuery({
    queryKey: ["quizVisibility", quizId],
    queryFn: async () => {
      if (!quizId) return null;
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/learning/custom/quiz/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.data;
    },
    enabled: !!quizId,
  });

  const quizVisibility = quizData?.visibility || "PRIVATE";
  const isPrivate = quizVisibility === "PRIVATE";
  const isFriendsOrPublic = quizVisibility === "FRIENDS" || quizVisibility === "PUBLIC";

  // Fetch friends list
  const { data: friends = [], isLoading: loading } = useQuery({
    queryKey: ["friends"],
    queryFn: async (): Promise<Friend[]> => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/friendships/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      const data: FriendsResponse = await res.json();
      return data.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch current shares for this quiz
  const { data: currentShares = [] } = useQuery({
    queryKey: ["quizShares", quizId],
    queryFn: async () => {
      if (!quizId) return [];
      const token = await getToken();
      const res = await fetch(
        `${BACKEND_URL}/learning/sharing/quiz/${quizId}/shares`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return data.data?.shares || [];
    },
    enabled: !!quizId,
  });

  // Initialize selected friends from current shares or all friends for FRIENDS/PUBLIC
  useEffect(() => {
    if (quizId) {
      if (isFriendsOrPublic) {
        // For FRIENDS/PUBLIC visibility, all friends are selected (but disabled)
        const allFriendIds = new Set<string>(friends.map((f) => f.id));
        setSelectedFriends(allFriendIds);
      } else {
        // For PRIVATE, only show explicitly shared friends
        const sharedUserIds = new Set<string>(
          currentShares.map((share: any) => share.sharedWith.id as string)
        );
        setSelectedFriends(sharedUserIds);
      }
    }
  }, [currentShares, quizId, friends, isFriendsOrPublic]);

  // Share with friend mutation
  const shareMutation = useMutation({
    mutationFn: async (friendId: string) => {
      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/quiz-shares`, {
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
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to share quiz");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizShares", quizId] });
      queryClient.invalidateQueries({ queryKey: ["sharedQuizzes"] });
      onShared?.();
    },
  });

  // Unshare mutation
  const unshareMutation = useMutation({
    mutationFn: async (friendId: string) => {
      const token = await getToken();
      const share = currentShares.find(
        (s: any) => s.sharedWith.id === friendId
      );
      if (!share) return;

      const response = await fetch(
        `${BACKEND_URL}/learning/sharing/${share.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to unshare quiz");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizShares", quizId] });
      queryClient.invalidateQueries({ queryKey: ["sharedQuizzes"] });
      onShared?.();
    },
  });

  const handleToggleFriend = (friendId: string) => {
    if (!isPrivate) return; // Don't allow changes for FRIENDS/PUBLIC

    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
      unshareMutation.mutate(friendId);
    } else {
      newSelected.add(friendId);
      shareMutation.mutate(friendId);
    }
    setSelectedFriends(newSelected);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Share "${quizName}"`}>
      {loading ? (
        <LoadingBar isLoading={true} text="Loading friends" />
      ) : friends.length === 0 ? (
        <p className="quiz-share-modal-empty-message">
          You don't have any friends yet. Follow friends to share quizzes with
          them!
        </p>
      ) : (
        <>
          <p className="quiz-share-modal-description">
            {isPrivate
              ? "Select friends who can access this quiz:"
              : "To control who can access your quiz, please change your profile privacy settings"}
          </p>
          <div className="quiz-share-modal-friends-list">
            {friends.map((friend) => (
              <label
                key={friend.id}
                className={`quiz-share-modal-friend-item ${!isPrivate ? "quiz-share-modal-friend-item-disabled" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={selectedFriends.has(friend.id)}
                  onChange={() => handleToggleFriend(friend.id)}
                  className="quiz-share-modal-checkbox"
                  disabled={
                    !isPrivate ||
                    shareMutation.isPending ||
                    unshareMutation.isPending
                  }
                />
                <span>{getUserDisplayName(friend)}</span>
              </label>
            ))}
          </div>

          <div className="quiz-share-modal-actions">
            <Button
              onClick={onClose}
              variant="secondary"
              disabled={shareMutation.isPending || unshareMutation.isPending}
            >
              Done
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}