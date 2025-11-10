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
import LoadingBar from "../../components/LoadingBar";
import "../../styles/pages/_friends.scss";
import goBackIcon from "../../assets/icons/goBackIcon.svg";

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [followingUserId, setFollowingUserId] = useState<string | null>(null);
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

  // Fetch following (people you follow)
  const { data: allFollowing = [] } = useQuery({
    queryKey: ["following"],
    queryFn: async (): Promise<Friend[]> => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/friendships/following`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch following");
      }

      const data: FriendsResponse = await res.json();
      return data.data || [];
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
  });

  // Fetch lesson requests
  const { data: lessonRequests = [] } = useQuery({
    queryKey: ["lessonRequests"],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/lesson-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        return [];
      }

      const data = await res.json();
      return data.data || [];
    },
    staleTime: 10 * 1000, // 10 seconds
    retry: 2,
  });

  // Followers: People who follow you but you don't follow back
  const followers = allFollowers.filter(
    (follower) => !allFollowing.some((followed) => followed.id === follower.id)
  );

  // Following: People you follow who don't follow you back
  const following = allFollowing.filter(
    (followedUser) => !allFollowers.some((follower) => follower.id === followedUser.id)
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
      setFollowingUserId(addresseeId);
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
    onSuccess: async () => {
      setFollowingUserId(null);
      setSearchResults([]);
      setSearchQuery("");
      // Refetch all queries immediately to update the UI
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["friends"] }),
        queryClient.refetchQueries({ queryKey: ["followers"] }),
        queryClient.refetchQueries({ queryKey: ["following"] }),
      ]);
    },
    onError: (err: Error) => {
      setFollowingUserId(null);
      alert(err.message);
    },
  });

  // Follow back mutation (for following back a follower)
  const followBackMutation = useMutation({
    mutationFn: async (addresseeId: string) => {
      setFollowingUserId(addresseeId);
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
    onSuccess: async () => {
      setFollowingUserId(null);
      alert("You are now friends!");
      // Refetch all queries immediately to update the UI
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["friends"] }),
        queryClient.refetchQueries({ queryKey: ["followers"] }),
        queryClient.refetchQueries({ queryKey: ["following"] }),
      ]);
    },
    onError: (err: Error) => {
      setFollowingUserId(null);
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
        throw new Error("Failed to unfollow friend");
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
    onError: (err: Error) => {
      console.error("Error removing friend:", err);
    },
  });

  // Accept lesson request mutation
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
      // Invalidate the requester's lesson request status so they can see the lessons
      queryClient.invalidateQueries({ queryKey: ["lessonRequestStatus", requesterId] });
      // Invalidate their friend quizzes query so lessons appear
      queryClient.invalidateQueries({ queryKey: ["friendQuizzes", requesterId] });
    },
    onError: (err: Error) => {
      alert(err.message);
    },
  });

  // Deny lesson request mutation
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
    },
    onError: (err: Error) => {
      alert(err.message);
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
    <div className="container">
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
        <h2 className="friends-search-title">Find Friends</h2>
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
                    disabled={followingUserId === user.id}
                  >
                    {followingUserId === user.id
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
                    disabled={followingUserId === user.id}
                    title="Follow back to become friends"
                  >
                    {followingUserId === user.id
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
                  disabled={followingUserId === follower.id}
                >
                  {followingUserId === follower.id ? "Following..." : "Follow Back"}
                </button>
                <button
                  className="friends-view-button"
                  onClick={() => navigate(`/profile/friends/${follower.id}`, { state: { from: "/profile/friends" } })}
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Following (people you follow but who don't follow you back) */}
      {following.length > 0 && (
        <div className="friends-pending-section">
          <h2 className="friends-pending-title">
            Following ({following.length})
          </h2>
          <p className="friends-followers-subtitle">
            People you follow who haven't followed you back yet
          </p>
          {following.map((followedUser) => (
            <div
              key={followedUser.id}
              className="friends-pending-item"
            >
              <div>
                <strong className="friends-user-name">{getUserDisplayName(followedUser)}</strong>
                <p className="friends-user-score">
                  Score: {followedUser.score}
                </p>
              </div>
              <div className="friends-pending-actions">
                <button
                  className="friends-view-button"
                  onClick={() => navigate(`/profile/friends/${followedUser.id}`)}
                >
                  View Profile
                </button>
                <button
                  className="friends-unfollow-button"
                  onClick={() => {
                    if (followedUser.friendshipId) {
                      removeFriendMutation.mutate(followedUser.friendshipId);
                    }
                  }}
                  disabled={removeFriendMutation.isPending}
                >
                  Unfollow
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Friends List (Mutual Follows) */}
      <div className="friends-list-section">
        <h2 className="friends-list-title">Friends - Mutual Follows ({friends.length})</h2>
        {loading ? (
          <LoadingBar isLoading={true} text="Loading friends" />
        ) : friends.length === 0 ? (
          <p className="friends-list-empty">
            No friends yet. Search for users to follow!
          </p>
        ) : (
          friends.map((friend) => {
            const lessonRequest = lessonRequests.find(
              (req: any) => req.requester.id === friend.id
            );
            
            return (
              <div
                key={friend.friendshipId}
                className="friends-list-item"
              >
                <div
                  className="friends-list-item-clickable"
                  onClick={() => navigate(`/profile/friends/${friend.id}`, { state: { from: "/profile/friends" } })}
                >
                  <strong className="friends-user-name">{getUserDisplayName(friend)}</strong>
                  <p className="friends-user-score">
                    Score: {friend.score}
                  </p>
                  {lessonRequest && (
                    <p className="friends-lesson-request-message">
                      Wants to see your lessons
                    </p>
                  )}
                </div>
                <div className="friends-list-item-actions">
                  {lessonRequest && (
                    <>
                      <button
                        className="friends-accept-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          acceptLessonRequestMutation.mutate(friend.id);
                        }}
                        disabled={acceptLessonRequestMutation.isPending || denyLessonRequestMutation.isPending}
                      >
                        {acceptLessonRequestMutation.isPending ? "..." : "Accept Lesson Request"}
                      </button>
                      <button
                        className="friends-deny-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          denyLessonRequestMutation.mutate(friend.id);
                        }}
                        disabled={acceptLessonRequestMutation.isPending || denyLessonRequestMutation.isPending}
                      >
                        {denyLessonRequestMutation.isPending ? "..." : "Deny"}
                      </button>
                    </>
                  )}
                  <button
                    className="friends-unfollow-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      friend.friendshipId && removeFriend(friend.friendshipId);
                    }}
                    disabled={removeFriendMutation.isPending}
                  >
                    Unfollow
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
    </div>
  );
}
