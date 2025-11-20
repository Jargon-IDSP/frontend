import { useState, useEffect } from "react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import type { Friend } from "../../types/friend";
import type { ShareModalProps } from "../../types/shareDrawer";
import { getUserDisplayName } from "../../types/friend";
import "../../styles/components/_shareDrawer.scss";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function ShareModal({
  isOpen,
  onClose,
  quizId,
  quizName,
}: ShareModalProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());

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
    enabled: isOpen && !!quizId,
  });

  const quizVisibility = quizData?.visibility || "PRIVATE";
  const isPrivate = quizVisibility === "PRIVATE";
  const isFriends = quizVisibility === "FRIENDS";
  const isPublic = quizVisibility === "PUBLIC";
  const isFriendsOrPublic = isFriends || isPublic;

  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: async (): Promise<Friend[]> => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/friendships/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.data || [];
    },
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });

  const { data: currentShares = [] } = useQuery({
    queryKey: ["quizShares", quizId],
    queryFn: async () => {
      if (!quizId) return [];
      const token = await getToken();
      const res = await fetch(
        `${BACKEND_URL}/quiz-shares/${quizId}/shares`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) return [];
      const data = await res.json();
      return data.data?.shares || [];
    },
    enabled: isOpen && !!quizId,
  });

  useEffect(() => {
    if (!quizId) return;

    setSelectedFriends((prevSelected) => {
      let newSelectedIds: Set<string>;

      if (isFriendsOrPublic) {
        newSelectedIds = new Set<string>(friends.map((f) => f.id));
      } else {
        newSelectedIds = new Set<string>(
          currentShares.map((share: any) => share.sharedWith.id as string)
        );
      }

      if (
        prevSelected.size === newSelectedIds.size &&
        Array.from(newSelectedIds).every((id) => prevSelected.has(id))
      ) {
        return prevSelected;
      }

      return newSelectedIds;
    });
  }, [currentShares, quizId, friends, isFriendsOrPublic]);

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
    },
  });

  const unshareMutation = useMutation({
    mutationFn: async (friendId: string) => {
      const token = await getToken();
      const share = currentShares.find(
        (s: any) => s.sharedWith.id === friendId
      );
      if (!share) return;

      const response = await fetch(
        `${BACKEND_URL}/quiz-shares/${share.id}`,
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
    },
  });

  const handleToggleFriend = (friendId: string) => {
    if (!isPrivate) return;

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
    <Modal isOpen={isOpen} onClose={onClose} title={`Share "${quizName}"`}>
      <div className="share-modal-description">
        {isPrivate
          ? "Select friends who can access this lesson"
          : "To control who can access your lesson, please change the lesson's visibility settings"}
      </div>

      <div className="share-drawer-friends">
        {friends.length === 0 ? (
          <div className="share-drawer-no-friends">
            <p>No friends to share with yet.</p>
          </div>
        ) : (
          friends.map((friend) => (
            <label
              key={friend.id}
              className={`share-drawer-friend ${!isPrivate ? "share-drawer-friend-disabled" : ""}`}
            >
              <input
                type="checkbox"
                checked={selectedFriends.has(friend.id)}
                onChange={() => handleToggleFriend(friend.id)}
                disabled={
                  !isPrivate ||
                  shareMutation.isPending ||
                  unshareMutation.isPending
                }
              />
              <span className="share-drawer-friend-name">
                {getUserDisplayName(friend)}
              </span>
            </label>
          ))
        )}
      </div>

      <div className="share-modal-actions">
        <Button
          onClick={onClose}
          variant="secondary"
        >
          Done
        </Button>
      </div>
    </Modal>
  );
}
