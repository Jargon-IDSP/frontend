import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BACKEND_URL } from "../../lib/api";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import { getUserDisplayName } from "../../types/friend";
import type { Friend } from "../../types/friend";
import type { QuizShareModalProps } from "@/types/components/quiz";
import type {
  FriendsResponse,
  ShareQuizRequest,
  ShareQuizResponse,
} from "@/types/api/friends";
import "../../styles/components/_quizShareModal.scss";

export default function QuizShareModal({
  quizId,
  quizName,
  onClose,
  onShared,
}: QuizShareModalProps) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(
    new Set()
  );

  const { data: friends = [], isLoading: loading } = useQuery({
    queryKey: ["friends"],
    queryFn: async (): Promise<Friend[]> => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/friendships`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch friends");
      }

      const data: FriendsResponse = await res.json();
      return data.data || [];
    },
    staleTime: 5 * 60 * 1000, 
  });

  const shareMutation = useMutation({
    mutationFn: async ({
      customQuizId,
      friendUserIds,
      token,
    }: ShareQuizRequest): Promise<ShareQuizResponse> => {
      const res = await fetch(
        `${BACKEND_URL}/learning/sharing/share-multiple`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customQuizId,
            friendUserIds,
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to share quiz");
      }

      return await res.json();
    },
    onSuccess: (data) => {
      alert(`Successfully shared with ${data.data.totalShared} friend(s)!`);
      onShared?.();
      onClose();
      queryClient.invalidateQueries({ queryKey: ["sharedQuizzes"] });
    },
    onError: (error: Error) => {
      alert(error.message || "Failed to share quiz");
    },
  });

  const toggleFriend = (friendId: string) => {
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedFriends(newSelected);
  };

  const handleShare = async () => {
    if (selectedFriends.size === 0) {
      alert("Please select at least one friend");
      return;
    }

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      shareMutation.mutate({
        customQuizId: quizId,
        friendUserIds: Array.from(selectedFriends),
        token,
      });
    } catch (err) {
      console.error("Auth error:", err);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Share "${quizName}"`}>
      {loading ? (
        <p>Loading friends...</p>
      ) : friends.length === 0 ? (
        <p className="quiz-share-modal-empty-message">
          You don't have any friends yet. Add friends to share quizzes with
          them!
        </p>
      ) : (
        <>
          <p className="quiz-share-modal-description">
            Select friends to share this quiz with:
          </p>
          <div className="quiz-share-modal-friends-list">
            {friends.map((friend) => (
              <label
                key={friend.id}
                className="quiz-share-modal-friend-item"
              >
                <input
                  type="checkbox"
                  checked={selectedFriends.has(friend.id)}
                  onChange={() => toggleFriend(friend.id)}
                  className="quiz-share-modal-checkbox"
                  disabled={shareMutation.isPending}
                />
                <span>{getUserDisplayName(friend)}</span>
              </label>
            ))}
          </div>

          <div className="quiz-share-modal-actions">
            <Button
              onClick={onClose}
              variant="secondary"
              disabled={shareMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={shareMutation.isPending || selectedFriends.size === 0}
              variant="primary"
            >
              {shareMutation.isPending
                ? "Sharing..."
                : `Share with ${selectedFriends.size} friend(s)`}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
