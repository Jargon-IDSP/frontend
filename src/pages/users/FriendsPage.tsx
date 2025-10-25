import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../lib/api";

interface Friend {
  friendshipId: string;
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  score: number;
}

interface PendingRequest {
  friendshipId: string;
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  score: number;
  createdAt: string;
}

interface SearchResult {
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  score: number;
  friendshipStatus: string;
  friendshipId: string | null;
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFriends();
    fetchPendingRequests();
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

  const fetchPendingRequests = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/friendships/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setPendingRequests(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching pending requests:", err);
    }
  };

  const searchUsers = async () => {
    if (searchQuery.length < 2) {
      setError("Search query must be at least 2 characters");
      return;
    }

    try {
      setSearching(true);
      setError(null);
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/friendships/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.data || []);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to search users");
      }
    } catch (err) {
      setError("Error searching users");
      console.error("Error searching users:", err);
    } finally {
      setSearching(false);
    }
  };

  const sendFriendRequest = async (addresseeId: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/friendships`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ addresseeId }),
      });
      
      if (res.ok) {
        setSearchResults([]);
        setSearchQuery("");
        alert("Friend request sent!");
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to send friend request");
      }
    } catch (err) {
      alert("Error sending friend request");
      console.error("Error sending friend request:", err);
    }
  };

  const acceptRequest = async (friendshipId: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/friendships/${friendshipId}/accept`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        fetchFriends();
        fetchPendingRequests();
      }
    } catch (err) {
      console.error("Error accepting request:", err);
    }
  };

  const rejectRequest = async (friendshipId: string) => {
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/friendships/${friendshipId}/reject`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        fetchPendingRequests();
      }
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };

  const removeFriend = async (friendshipId: string) => {
    if (!confirm("Are you sure you want to remove this friend?")) return;

    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/friendships/${friendshipId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        fetchFriends();
      }
    } catch (err) {
      console.error("Error removing friend:", err);
    }
  };

  const getUserDisplayName = (user: Friend | PendingRequest | SearchResult) => {
    if (user.username) return user.username;
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.email;
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <button onClick={() => navigate("/profile")} style={{ marginBottom: "1rem" }}>
        ← Back to Profile
      </button>

      <h1 style={{ marginBottom: "2rem" }}>Friends</h1>

      {/* Search Section */}
      <div style={{ marginBottom: "2rem", backgroundColor: "#fff", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
        <h2 style={{ marginBottom: "1rem" }}>Add Friends</h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && searchUsers()}
            style={{
              flex: 1,
              padding: "0.75rem",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontSize: "1rem",
            }}
          />
          <button
            onClick={searchUsers}
            disabled={searching}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: searching ? "not-allowed" : "pointer",
              fontWeight: "600",
            }}
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: "1rem", padding: "0.75rem", backgroundColor: "#fee", color: "#c00", borderRadius: "6px" }}>
            {error}
          </div>
        )}

        {searchResults.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            {searchResults.map((user) => (
              <div
                key={user.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <div>
                  <strong>{getUserDisplayName(user)}</strong>
                  <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "#6b7280" }}>
                    Score: {user.score}
                  </p>
                </div>
                {user.friendshipStatus === "none" && (
                  <button
                    onClick={() => sendFriendRequest(user.id)}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Add Friend
                  </button>
                )}
                {user.friendshipStatus === "friends" && (
                  <span style={{ color: "#10b981", fontWeight: "600" }}>✓ Friends</span>
                )}
                {user.friendshipStatus === "pending_sent" && (
                  <span style={{ color: "#6b7280", fontWeight: "600" }}>Request Sent</span>
                )}
                {user.friendshipStatus === "pending_received" && (
                  <span style={{ color: "#f59e0b", fontWeight: "600" }}>Pending Request</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div style={{ marginBottom: "2rem", backgroundColor: "#fff", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
          <h2 style={{ marginBottom: "1rem" }}>Pending Requests ({pendingRequests.length})</h2>
          {pendingRequests.map((request) => (
            <div
              key={request.friendshipId}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <div>
                <strong>{getUserDisplayName(request)}</strong>
                <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "#6b7280" }}>
                  Score: {request.score}
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => acceptRequest(request.friendshipId)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Accept
                </button>
                <button
                  onClick={() => rejectRequest(request.friendshipId)}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Friends List */}
      <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
        <h2 style={{ marginBottom: "1rem" }}>My Friends ({friends.length})</h2>
        {loading ? (
          <p style={{ color: "#6b7280" }}>Loading...</p>
        ) : friends.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No friends yet. Search for users to add friends!</p>
        ) : (
          friends.map((friend) => (
            <div
              key={friend.friendshipId}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <div>
                <strong>{getUserDisplayName(friend)}</strong>
                <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "#6b7280" }}>
                  Score: {friend.score}
                </p>
              </div>
              <button
                onClick={() => removeFriend(friend.friendshipId)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
