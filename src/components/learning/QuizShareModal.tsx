import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../../lib/api";
import type { Friend, QuizShareModalProps } from "../../types/learning";

export default function QuizShareModal({ quizId, quizName, onClose, onShared }: QuizShareModalProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const { getToken } = useAuth();

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/friendships`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setFriends(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching friends:", err);
    } finally {
      setLoading(false);
    }
  };

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
      setSharing(true);
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/quiz-shares/multiple`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customQuizId: quizId,
          friendUserIds: Array.from(selectedFriends),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Successfully shared with ${data.data.totalShared} friend(s)!`);
        onShared?.();
        onClose();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to share quiz");
      }
    } catch (err) {
      console.error("Error sharing quiz:", err);
      alert("Failed to share quiz");
    } finally {
      setSharing(false);
    }
  };

  const getUserDisplayName = (friend: Friend) => {
    if (friend.username) return friend.username;
    if (friend.firstName || friend.lastName) {
      return `${friend.firstName || ""} ${friend.lastName || ""}`.trim();
    }
    return friend.email;
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "2rem",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "80vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0 }}>Share "{quizName}"</h2>

        {loading ? (
          <p>Loading friends...</p>
        ) : friends.length === 0 ? (
          <p style={{ color: "#6b7280" }}>
            You don't have any friends yet. Add friends to share quizzes with them!
          </p>
        ) : (
          <>
            <p style={{ marginBottom: "1rem", color: "#6b7280" }}>
              Select friends to share this quiz with:
            </p>
            <div style={{ maxHeight: "300px", overflow: "auto", marginBottom: "1.5rem" }}>
              {friends.map((friend) => (
                <label
                  key={friend.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0.75rem",
                    borderBottom: "1px solid #e5e7eb",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedFriends.has(friend.id)}
                    onChange={() => toggleFriend(friend.id)}
                    style={{ marginRight: "0.75rem", cursor: "pointer" }}
                  />
                  <span>{getUserDisplayName(friend)}</span>
                </label>
              ))}
            </div>

            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
              <button
                onClick={onClose}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#f3f4f6",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                disabled={sharing || selectedFriends.size === 0}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: selectedFriends.size === 0 ? "#9ca3af" : "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: selectedFriends.size === 0 ? "not-allowed" : "pointer",
                  fontWeight: "600",
                }}
              >
                {sharing ? "Sharing..." : `Share with ${selectedFriends.size} friend(s)`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
