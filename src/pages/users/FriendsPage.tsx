import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BACKEND_URL } from "../../lib/api";
import type { Friend, PendingRequest, SearchResult } from "../../types/friend";
import "../../styles/pages/_friends.scss";
import deleteIcon from "../../assets/icons/deleteIcon.svg";
import goBackIcon from "../../assets/icons/goBackIcon.svg";

interface FriendsResponse {
  data: Friend[];
}

interface PendingRequestsResponse {
  data: PendingRequest[];
}

interface SearchResponse {
  data: SearchResult[];
}

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch friends
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
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });

  // Fetch pending requests
  const { data: pendingRequests = [] } = useQuery({
    queryKey: ["pendingRequests"],
    queryFn: async (): Promise<PendingRequest[]> => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/friendships/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch pending requests");
      }

      const data: PendingRequestsResponse = await res.json();
      return data.data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });

  // Search users mutation
  const searchUsersMutation = useMutation({
    mutationFn: async (query: string): Promise<SearchResult[]> => {
      if (query.length < 2) {
        throw new Error("Search query must be at least 2 characters");
      }

      const token = await getToken();
      const res = await fetch(
        `${BACKEND_URL}/friendships/search?q=${encodeURIComponent(query)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to search users");
      }

      const data: SearchResponse = await res.json();
      return data.data || [];
    },
    onSuccess: (data) => {
      setSearchResults(data);
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
      setSearchResults([]);
    },
  });

  // Send friend request mutation
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
    onSuccess: () => {
      setSearchResults([]);
      setSearchQuery("");
      alert("Friend request sent!");
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
    },
    onError: (err: Error) => {
      alert(err.message);
    },
  });

  // Accept request mutation
  const acceptRequestMutation = useMutation({
    mutationFn: async (friendshipId: string) => {
      const token = await getToken();
      const res = await fetch(
        `${BACKEND_URL}/friendships/${friendshipId}/accept`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to accept request");
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
    },
    onError: (err: Error) => {
      console.error("Error accepting request:", err);
    },
  });

  // Reject request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: async (friendshipId: string) => {
      const token = await getToken();
      const res = await fetch(
        `${BACKEND_URL}/friendships/${friendshipId}/reject`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to reject request");
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
    },
    onError: (err: Error) => {
      console.error("Error rejecting request:", err);
    },
  });

  // Remove friend mutation
  const removeFriendMutation = useMutation({
    mutationFn: async (friendshipId: string) => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/friendships/${friendshipId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to remove friend");
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (err: Error) => {
      console.error("Error removing friend:", err);
    },
  });

  const searchUsers = () => {
    setError(null);
    searchUsersMutation.mutate(searchQuery);
  };

  const sendFriendRequest = (addresseeId: string) => {
    sendRequestMutation.mutate(addresseeId);
  };

  const acceptRequest = (friendshipId: string) => {
    acceptRequestMutation.mutate(friendshipId);
  };

  const rejectRequest = (friendshipId: string) => {
    rejectRequestMutation.mutate(friendshipId);
  };

  const removeFriend = (friendshipId: string) => {
    if (!confirm("Are you sure you want to remove this friend?")) return;
    removeFriendMutation.mutate(friendshipId);
  };

  const getUserDisplayName = (user: Friend | PendingRequest | SearchResult) => {
    if (user.username) return user.username;
    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    return user.email;
  };

  return (
    <div className="friends-page">
      <div className="friends-header">
        <button
          className="friends-back-button"
          onClick={() => navigate(-1)}
        >
          <img src={goBackIcon} alt="Back Button" />
        </button>
        <h1 className="friends-title">Friends</h1>
      </div>


      {/* Search Section */}
      <div className="friends-search-section">
        <h2 className="friends-search-title">Add Friends</h2>
        <div className="friends-search-container">
          <input
            type="text"
            className="friends-search-input"
            placeholder="Search by username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && searchUsers()}
          />
          <button
            className="friends-search-button"
            onClick={searchUsers}
            disabled={searchUsersMutation.isPending}
          >
            {searchUsersMutation.isPending ? "Searching..." : "Search"}
          </button>
        </div>

        {error && (
          <div className="friends-error-message">
            {error}
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="friends-search-results">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="friends-search-result-item"
              >
                <div>
                  <strong className="friends-user-name">{getUserDisplayName(user)}</strong>
                  <p className="friends-user-score">
                    Score: {user.score}
                  </p>
                </div>
                {user.friendshipStatus === "none" && (
                  <button
                    className="friends-add-button"
                    onClick={() => sendFriendRequest(user.id)}
                    disabled={sendRequestMutation.isPending}
                  >
                    {sendRequestMutation.isPending
                      ? "Sending..."
                      : "Add Friend"}
                  </button>
                )}
                {user.friendshipStatus === "friends" && (
                  <span className="friends-status-badge friends-status-badge--friends">
                    ✓ Friends
                  </span>
                )}
                {user.friendshipStatus === "pending_sent" && (
                  <span className="friends-status-badge friends-status-badge--pending-sent">
                    Request Sent
                  </span>
                )}
                {user.friendshipStatus === "pending_received" && (
                  <span className="friends-status-badge friends-status-badge--pending-received">
                    Pending Request
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="friends-pending-section">
          <h2 className="friends-pending-title">
            Pending Requests ({pendingRequests.length})
          </h2>
          {pendingRequests.map((request) => (
            <div
              key={request.friendshipId}
              className="friends-pending-item"
            >
              <div>
                <strong className="friends-user-name">{getUserDisplayName(request)}</strong>
                <p className="friends-user-score">
                  Score: {request.score}
                </p>
              </div>
              <div className="friends-pending-actions">
                <button
                  className="friends-accept-button"
                  onClick={() =>
                    request.friendshipId && acceptRequest(request.friendshipId)
                  }
                  disabled={acceptRequestMutation.isPending}
                >
                  Accept
                </button>
                <button
                  className="friends-reject-button"
                  onClick={() =>
                    request.friendshipId && rejectRequest(request.friendshipId)
                  }
                  disabled={rejectRequestMutation.isPending}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Friends List */}
      <div className="friends-list-section">
        <h2 className="friends-list-title">My Friends ({friends.length})</h2>
        {loading ? (
          <p className="friends-list-loading">Loading...</p>
        ) : friends.length === 0 ? (
          <p className="friends-list-empty">
            No friends yet. Search for users to add friends!
          </p>
        ) : (
          friends.map((friend) => (
            <div
              key={friend.friendshipId}
              className="friends-list-item"
            >
              <div>
                <strong className="friends-user-name">{getUserDisplayName(friend)}</strong>
                <p className="friends-user-score">
                  Score: {friend.score}
                </p>
              </div>
              <button
                className="friends-remove-button"
                onClick={() =>
                  friend.friendshipId && removeFriend(friend.friendshipId)
                }
                disabled={removeFriendMutation.isPending}
              >
                <img src={deleteIcon} alt="Delete Icon" className="friends-remove-button-icon" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
