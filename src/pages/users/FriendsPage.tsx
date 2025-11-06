import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BACKEND_URL } from "../../lib/api";
import type {
  Friend,
  SearchResult,
  FriendsResponse,
  SearchResponse
} from "../../types/friend";
import "../../styles/pages/_friends.scss";
import deleteIcon from "../../assets/icons/deleteIcon.svg";
import goBackIcon from "../../assets/icons/goBackIcon.svg";

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

  // Fetch followers (people who follow you)
  const { data: allFollowers = [] } = useQuery({
    queryKey: ["followers"],
    queryFn: async (): Promise<Friend[]> => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/friendships/followers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch followers");
      }

      const data: FriendsResponse = await res.json();
      return data.data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });

  // Filter out followers who are already friends (mutual follows)
  const followers = allFollowers.filter(
    (follower) => !friends.some((friend) => friend.id === follower.id)
  );

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
      alert("Now following!");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
    },
    onError: (err: Error) => {
      alert(err.message);
    },
  });

  // Follow back mutation (for following back a follower)
  const followBackMutation = useMutation({
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
        throw new Error(errorData.error || "Failed to follow back");
      }

      return await res.json();
    },
    onSuccess: () => {
      alert("You are now friends!");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
    },
    onError: (err: Error) => {
      alert(err.message);
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

  const followBack = (addresseeId: string) => {
    followBackMutation.mutate(addresseeId);
  };

  const removeFriend = (friendshipId: string) => {
    if (!confirm("Are you sure you want to unfollow this friend?")) return;
    removeFriendMutation.mutate(friendshipId);
  };

  const getUserDisplayName = (user: Friend | SearchResult) => {
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
                      ? "Following..."
                      : "Follow"}
                  </button>
                )}
                {user.friendshipStatus === "friends" && (
                  <span className="friends-status-badge friends-status-badge--friends">
                    ✓ Friends
                  </span>
                )}
                {user.friendshipStatus === "following" && (
                  <span className="friends-status-badge friends-status-badge--pending-sent">
                    Following
                  </span>
                )}
                {user.friendshipStatus === "follower" && (
                  <button
                    className="friends-add-button"
                    onClick={() => sendFriendRequest(user.id)}
                    disabled={sendRequestMutation.isPending}
                    title="Follow back to become friends"
                  >
                    {sendRequestMutation.isPending
                      ? "Following..."
                      : "Follow Back"}
                  </button>
                )}
                {user.friendshipStatus === "blocked_by_you" && (
                  <span className="friends-status-badge friends-status-badge--blocked">
                    Blocked
                  </span>
                )}
                {user.friendshipStatus === "blocked_by_them" && (
                  <span className="friends-status-badge friends-status-badge--blocked">
                    Unavailable
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Followers (people who follow you but you don't follow back) */}
      {followers.length > 0 && (
        <div className="friends-pending-section">
          <h2 className="friends-pending-title">
            Followers ({followers.length})
          </h2>
          <p className="friends-followers-subtitle">
            Follow back to become friends
          </p>
          {followers.map((follower) => (
            <div
              key={follower.id}
              className="friends-pending-item"
            >
              <div>
                <strong className="friends-user-name">{getUserDisplayName(follower)}</strong>
                <p className="friends-user-score">
                  Score: {follower.score}
                </p>
              </div>
              <div className="friends-pending-actions">
                <button
                  className="friends-accept-button"
                  onClick={() => followBack(follower.id)}
                  disabled={followBackMutation.isPending}
                >
                  {followBackMutation.isPending ? "Following..." : "Follow Back"}
                </button>
                <button
                  className="friends-view-button"
                  onClick={() => navigate(`/profile/friends/${follower.id}`)}
                >
                  View Profile
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
              <div
                className="friends-list-item-clickable"
                onClick={() => navigate(`/profile/friends/${friend.id}`)}
              >
                <strong className="friends-user-name">{getUserDisplayName(friend)}</strong>
                <p className="friends-user-score">
                  Score: {friend.score}
                </p>
              </div>
              <button
                className="friends-remove-button"
                onClick={(e) => {
                  e.stopPropagation();
                  friend.friendshipId && removeFriend(friend.friendshipId);
                }}
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
