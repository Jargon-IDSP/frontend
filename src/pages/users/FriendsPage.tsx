import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BACKEND_URL } from "../../lib/api";
import type { Friend, PendingRequest, SearchResult } from "../../types/friend";

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
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <button
        onClick={() => navigate("/profile")}
        style={{ marginBottom: "1rem" }}
      >
        ← Back to Profile
      </button>

      <h1 style={{ marginBottom: "2rem" }}>Friends</h1>

      {/* Search Section */}
      <div
        style={{
          marginBottom: "2rem",
          backgroundColor: "#fff",
          padding: "1.5rem",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
        }}
      >
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
            disabled={searchUsersMutation.isPending}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: searchUsersMutation.isPending ? "not-allowed" : "pointer",
              fontWeight: "600",
            }}
          >
            {searchUsersMutation.isPending ? "Searching..." : "Search"}
          </button>
        </div>

        {error && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem",
              backgroundColor: "#fee",
              color: "#c00",
              borderRadius: "6px",
            }}
          >
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
                  <p
                    style={{
                      margin: "0.25rem 0 0 0",
                      fontSize: "0.875rem",
                      color: "#6b7280",
                    }}
                  >
                    Score: {user.score}
                  </p>
                </div>
                {user.friendshipStatus === "none" && (
                  <button
                    onClick={() => sendFriendRequest(user.id)}
                    disabled={sendRequestMutation.isPending}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#10b981",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: sendRequestMutation.isPending
                        ? "not-allowed"
                        : "pointer",
                      fontWeight: "600",
                    }}
                  >
                    {sendRequestMutation.isPending
                      ? "Sending..."
                      : "Add Friend"}
                  </button>
                )}
                {user.friendshipStatus === "friends" && (
                  <span style={{ color: "#10b981", fontWeight: "600" }}>
                    ✓ Friends
                  </span>
                )}
                {user.friendshipStatus === "pending_sent" && (
                  <span style={{ color: "#6b7280", fontWeight: "600" }}>
                    Request Sent
                  </span>
                )}
                {user.friendshipStatus === "pending_received" && (
                  <span style={{ color: "#f59e0b", fontWeight: "600" }}>
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
        <div
          style={{
            marginBottom: "2rem",
            backgroundColor: "#fff",
            padding: "1.5rem",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          <h2 style={{ marginBottom: "1rem" }}>
            Pending Requests ({pendingRequests.length})
          </h2>
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
                <p
                  style={{
                    margin: "0.25rem 0 0 0",
                    fontSize: "0.875rem",
                    color: "#6b7280",
                  }}
                >
                  Score: {request.score}
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() =>
                    request.friendshipId && acceptRequest(request.friendshipId)
                  }
                  disabled={acceptRequestMutation.isPending}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: acceptRequestMutation.isPending
                      ? "not-allowed"
                      : "pointer",
                    fontWeight: "600",
                  }}
                >
                  Accept
                </button>
                <button
                  onClick={() =>
                    request.friendshipId && rejectRequest(request.friendshipId)
                  }
                  disabled={rejectRequestMutation.isPending}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: rejectRequestMutation.isPending
                      ? "not-allowed"
                      : "pointer",
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
      <div
        style={{
          backgroundColor: "#fff",
          padding: "1.5rem",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
        }}
      >
        <h2 style={{ marginBottom: "1rem" }}>My Friends ({friends.length})</h2>
        {loading ? (
          <p style={{ color: "#6b7280" }}>Loading...</p>
        ) : friends.length === 0 ? (
          <p style={{ color: "#6b7280" }}>
            No friends yet. Search for users to add friends!
          </p>
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
                <p
                  style={{
                    margin: "0.25rem 0 0 0",
                    fontSize: "0.875rem",
                    color: "#6b7280",
                  }}
                >
                  Score: {friend.score}
                </p>
              </div>
              <button
                onClick={() =>
                  friend.friendshipId && removeFriend(friend.friendshipId)
                }
                disabled={removeFriendMutation.isPending}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: removeFriendMutation.isPending
                    ? "not-allowed"
                    : "pointer",
                  fontWeight: "600",
                }}
              >
                {removeFriendMutation.isPending ? "Removing..." : "Remove"}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// import { useState, useEffect } from "react";
// import { useAuth } from "@clerk/clerk-react";
// import { useNavigate } from "react-router-dom";
// import { BACKEND_URL } from "../../lib/api";
// import type { Friend, PendingRequest, SearchResult } from "../../types/friend";

// export default function FriendsPage() {
//   const [friends, setFriends] = useState<Friend[]>([]);
//   const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searching, setSearching] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const { getToken } = useAuth();
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchFriends();
//     fetchPendingRequests();
//   }, []);

//   const fetchFriends = async () => {
//     try {
//       const token = await getToken();
//       const res = await fetch(`${BACKEND_URL}/friendships`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (res.ok) {
//         const data = await res.json();
//         setFriends(data.data || []);
//       }
//     } catch (err) {
//       console.error("Error fetching friends:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchPendingRequests = async () => {
//     try {
//       const token = await getToken();
//       const res = await fetch(`${BACKEND_URL}/friendships/pending`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (res.ok) {
//         const data = await res.json();
//         setPendingRequests(data.data || []);
//       }
//     } catch (err) {
//       console.error("Error fetching pending requests:", err);
//     }
//   };

//   const searchUsers = async () => {
//     if (searchQuery.length < 2) {
//       setError("Search query must be at least 2 characters");
//       return;
//     }

//     try {
//       setSearching(true);
//       setError(null);
//       const token = await getToken();
//       const res = await fetch(`${BACKEND_URL}/friendships/search?q=${encodeURIComponent(searchQuery)}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (res.ok) {
//         const data = await res.json();
//         setSearchResults(data.data || []);
//       } else {
//         const errorData = await res.json();
//         setError(errorData.error || "Failed to search users");
//       }
//     } catch (err) {
//       setError("Error searching users");
//       console.error("Error searching users:", err);
//     } finally {
//       setSearching(false);
//     }
//   };

//   const sendFriendRequest = async (addresseeId: string) => {
//     try {
//       const token = await getToken();
//       const res = await fetch(`${BACKEND_URL}/friendships`, {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ addresseeId }),
//       });

//       if (res.ok) {
//         setSearchResults([]);
//         setSearchQuery("");
//         alert("Friend request sent!");
//       } else {
//         const errorData = await res.json();
//         alert(errorData.error || "Failed to send friend request");
//       }
//     } catch (err) {
//       alert("Error sending friend request");
//       console.error("Error sending friend request:", err);
//     }
//   };

//   const acceptRequest = async (friendshipId: string) => {
//     try {
//       const token = await getToken();
//       const res = await fetch(`${BACKEND_URL}/friendships/${friendshipId}/accept`, {
//         method: "PUT",
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (res.ok) {
//         fetchFriends();
//         fetchPendingRequests();
//       }
//     } catch (err) {
//       console.error("Error accepting request:", err);
//     }
//   };

//   const rejectRequest = async (friendshipId: string) => {
//     try {
//       const token = await getToken();
//       const res = await fetch(`${BACKEND_URL}/friendships/${friendshipId}/reject`, {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (res.ok) {
//         fetchPendingRequests();
//       }
//     } catch (err) {
//       console.error("Error rejecting request:", err);
//     }
//   };

//   const removeFriend = async (friendshipId: string) => {
//     if (!confirm("Are you sure you want to remove this friend?")) return;

//     try {
//       const token = await getToken();
//       const res = await fetch(`${BACKEND_URL}/friendships/${friendshipId}`, {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (res.ok) {
//         fetchFriends();
//       }
//     } catch (err) {
//       console.error("Error removing friend:", err);
//     }
//   };

//   const getUserDisplayName = (user: Friend | PendingRequest | SearchResult) => {
//     if (user.username) return user.username;
//     if (user.firstName || user.lastName) {
//       return `${user.firstName || ''} ${user.lastName || ''}`.trim();
//     }
//     return user.email;
//   };

//   return (
//     <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
//       <button onClick={() => navigate("/profile")} style={{ marginBottom: "1rem" }}>
//         ← Back to Profile
//       </button>

//       <h1 style={{ marginBottom: "2rem" }}>Friends</h1>

//       {/* Search Section */}
//       <div style={{ marginBottom: "2rem", backgroundColor: "#fff", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
//         <h2 style={{ marginBottom: "1rem" }}>Add Friends</h2>
//         <div style={{ display: "flex", gap: "0.5rem" }}>
//           <input
//             type="text"
//             placeholder="Search by username or email..."
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             onKeyPress={(e) => e.key === "Enter" && searchUsers()}
//             style={{
//               flex: 1,
//               padding: "0.75rem",
//               border: "1px solid #e5e7eb",
//               borderRadius: "6px",
//               fontSize: "1rem",
//             }}
//           />
//           <button
//             onClick={searchUsers}
//             disabled={searching}
//             style={{
//               padding: "0.75rem 1.5rem",
//               backgroundColor: "#3b82f6",
//               color: "white",
//               border: "none",
//               borderRadius: "6px",
//               cursor: searching ? "not-allowed" : "pointer",
//               fontWeight: "600",
//             }}
//           >
//             {searching ? "Searching..." : "Search"}
//           </button>
//         </div>

//         {error && (
//           <div style={{ marginTop: "1rem", padding: "0.75rem", backgroundColor: "#fee", color: "#c00", borderRadius: "6px" }}>
//             {error}
//           </div>
//         )}

//         {searchResults.length > 0 && (
//           <div style={{ marginTop: "1rem" }}>
//             {searchResults.map((user) => (
//               <div
//                 key={user.id}
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   padding: "1rem",
//                   borderBottom: "1px solid #e5e7eb",
//                 }}
//               >
//                 <div>
//                   <strong>{getUserDisplayName(user)}</strong>
//                   <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "#6b7280" }}>
//                     Score: {user.score}
//                   </p>
//                 </div>
//                 {user.friendshipStatus === "none" && (
//                   <button
//                     onClick={() => sendFriendRequest(user.id)}
//                     style={{
//                       padding: "0.5rem 1rem",
//                       backgroundColor: "#10b981",
//                       color: "white",
//                       border: "none",
//                       borderRadius: "6px",
//                       cursor: "pointer",
//                       fontWeight: "600",
//                     }}
//                   >
//                     Add Friend
//                   </button>
//                 )}
//                 {user.friendshipStatus === "friends" && (
//                   <span style={{ color: "#10b981", fontWeight: "600" }}>✓ Friends</span>
//                 )}
//                 {user.friendshipStatus === "pending_sent" && (
//                   <span style={{ color: "#6b7280", fontWeight: "600" }}>Request Sent</span>
//                 )}
//                 {user.friendshipStatus === "pending_received" && (
//                   <span style={{ color: "#f59e0b", fontWeight: "600" }}>Pending Request</span>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Pending Requests */}
//       {pendingRequests.length > 0 && (
//         <div style={{ marginBottom: "2rem", backgroundColor: "#fff", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
//           <h2 style={{ marginBottom: "1rem" }}>Pending Requests ({pendingRequests.length})</h2>
//           {pendingRequests.map((request) => (
//             <div
//               key={request.friendshipId}
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 padding: "1rem",
//                 borderBottom: "1px solid #e5e7eb",
//               }}
//             >
//               <div>
//                 <strong>{getUserDisplayName(request)}</strong>
//                 <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "#6b7280" }}>
//                   Score: {request.score}
//                 </p>
//               </div>
//               <div style={{ display: "flex", gap: "0.5rem" }}>
//                 <button
//                   onClick={() => request.friendshipId && acceptRequest(request.friendshipId)}
//                   style={{
//                     padding: "0.5rem 1rem",
//                     backgroundColor: "#10b981",
//                     color: "white",
//                     border: "none",
//                     borderRadius: "6px",
//                     cursor: "pointer",
//                     fontWeight: "600",
//                   }}
//                 >
//                   Accept
//                 </button>
//                 <button
//                   onClick={() => request.friendshipId && rejectRequest(request.friendshipId)}
//                   style={{
//                     padding: "0.5rem 1rem",
//                     backgroundColor: "#ef4444",
//                     color: "white",
//                     border: "none",
//                     borderRadius: "6px",
//                     cursor: "pointer",
//                     fontWeight: "600",
//                   }}
//                 >
//                   Reject
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Friends List */}
//       <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
//         <h2 style={{ marginBottom: "1rem" }}>My Friends ({friends.length})</h2>
//         {loading ? (
//           <p style={{ color: "#6b7280" }}>Loading...</p>
//         ) : friends.length === 0 ? (
//           <p style={{ color: "#6b7280" }}>No friends yet. Search for users to add friends!</p>
//         ) : (
//           friends.map((friend) => (
//             <div
//               key={friend.friendshipId}
//               style={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 padding: "1rem",
//                 borderBottom: "1px solid #e5e7eb",
//               }}
//             >
//               <div>
//                 <strong>{getUserDisplayName(friend)}</strong>
//                 <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "#6b7280" }}>
//                   Score: {friend.score}
//                 </p>
//               </div>
//               <button
//                 onClick={() => friend.friendshipId && removeFriend(friend.friendshipId)}
//                 style={{
//                   padding: "0.5rem 1rem",
//                   backgroundColor: "#ef4444",
//                   color: "white",
//                   border: "none",
//                   borderRadius: "6px",
//                   cursor: "pointer",
//                   fontWeight: "600",
//                 }}
//               >
//                 Remove
//               </button>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }
