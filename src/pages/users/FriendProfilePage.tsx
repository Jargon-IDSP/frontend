import { useAuth } from "@clerk/clerk-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BACKEND_URL } from "../../lib/api";
import { FriendshipStatus } from "../../types/friend";
import "../../styles/pages/_friendProfile.scss";
import goBackIcon from "../../assets/icons/goBackIcon.svg";
import rockyWhiteLogo from "/rockyWhite.svg";

const industryIdToName: { [key: number]: string } = {
  1: "Electrician",
  2: "Plumber",
  3: "Carpenter",
  4: "Mechanic",
  5: "Welder",
};

interface FriendProfile {
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  score: number;
  industryId: number | null;
  createdAt?: string;
  // Add any other fields that might come from the backend
}

interface FriendQuiz {
  id: string;
  name: string;
}

export default function FriendProfilePage() {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  // Fetch current user's profile to check if viewing own profile
  const { data: currentUserProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user || data;
    },
  });

  const isOwnProfile = currentUserProfile?.id === friendId;

  // Fetch friend profile data
  const { data: friendProfile, isLoading, error } = useQuery({
    queryKey: ["friendProfile", friendId],
    queryFn: async (): Promise<FriendProfile> => {
      const token = await getToken();

      // Try to fetch from users endpoint first
      let res = await fetch(`${BACKEND_URL}/users/${friendId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // If that works, return the data
      if (res.ok) {
        const data = await res.json();
        return data.data || data;
      }

      // If users endpoint fails, try getting from friendships list
      const friendsRes = await fetch(`${BACKEND_URL}/friendships`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (friendsRes.ok) {
        const friendsData = await friendsRes.json();
        const friends = friendsData.data || [];
        const friend = friends.find((f: any) => f.id === friendId);

        if (friend) {
          return friend;
        }
      }

      // If both fail, try getting basic info from leaderboard
      const leaderboardRes = await fetch(`${BACKEND_URL}/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (leaderboardRes.ok) {
        const leaderboardData = await leaderboardRes.json();
        const users = leaderboardData.data || [];
        const user = users.find((u: any) => u.id === friendId);

        if (user) {
          // Return minimal profile data from leaderboard
          return {
            id: user.id,
            username: null,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email || '',
            score: user.score,
            industryId: null,
            createdAt: user.createdAt,
          };
        }
      }

      throw new Error("User not found");
    },
    enabled: !!friendId,
  });

  // Fetch follower count
  const { data: followerCountData } = useQuery({
    queryKey: ["followerCount", friendId],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(
        `${BACKEND_URL}/friendships/${friendId}/followers/count`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) return { count: 0 };
      const data = await res.json();
      return data.data || { count: 0 };
    },
    enabled: !!friendId,
  });

  // Fetch following count
  const { data: followingCountData } = useQuery({
    queryKey: ["followingCount", friendId],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(
        `${BACKEND_URL}/friendships/${friendId}/following/count`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) return { count: 0 };
      const data = await res.json();
      return data.data || { count: 0 };
    },
    enabled: !!friendId,
  });

  // Fetch lesson request status
  const { data: lessonRequestStatus } = useQuery({
    queryKey: ["lessonRequestStatus", friendId],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(
        `${BACKEND_URL}/lesson-requests/status/${friendId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) return { status: null, hasAccess: false };
      const data = await res.json();
      return data.data || { status: null, hasAccess: false };
    },
    enabled: !!friendId && !isOwnProfile,
  });

  // Fetch friend's quiz count (all custom quizzes they created)
  const { data: quizCountData } = useQuery({
    queryKey: ["friendQuizCount", friendId],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(
        `${BACKEND_URL}/learning/custom/users/${friendId}/quizzes/count`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) return { count: 0 };
      const data = await res.json();
      return data.data || { count: 0 };
    },
    enabled: !!friendId,
  });

  // Check friendship status
  const { data: friendshipStatus } = useQuery({
    queryKey: ["friendshipStatus", friendId],
    queryFn: async (): Promise<{
      isFriend: boolean;
      isFollowing: boolean;
      friendshipId: string | null;
      status?: string;
      isBlocked?: boolean;
    }> => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/friendships`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        return { isFriend: false, isFollowing: false, friendshipId: null };
      }

      const data = await res.json();
      const friends = data.data || [];
      const friend = friends.find((f: any) => f.id === friendId);

      const status = friend?.status || null;
      const isBlocked = status === FriendshipStatus.BLOCKED;
      const isAccepted = status === FriendshipStatus.ACCEPTED || status === "ACCEPTED";
      const isPending = status === FriendshipStatus.PENDING || status === "PENDING";
      
      // isFollowing = true if you're following them (regardless of whether they follow back)
      const isFollowing = !!friend && (isAccepted || isPending);

      return {
        isFriend: !!friend && isAccepted,
        isFollowing,
        friendshipId: friend?.friendshipId || null,
        status: status || null,
        isBlocked,
      };
    },
    enabled: !!friendId && !isOwnProfile,
  });

  // Fetch lesson names (not full quiz data)
  const { data: friendQuizzes = [] } = useQuery({
    queryKey: ["friendLessons", friendId, lessonRequestStatus?.hasAccess],
    queryFn: async (): Promise<FriendQuiz[]> => {
      const token = await getToken();

      const res = await fetch(
        `${BACKEND_URL}/learning/custom/users/${friendId}/lessons`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        return data.data || [];
      }

      return [];
    },
    enabled: !!friendId && (isOwnProfile || friendshipStatus?.isFriend === true),
  });

  // Send friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/friendships`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ addresseeId: friendId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to send friend request");
      }

      return await res.json();
    },
    onSuccess: () => {
      alert("Friend request sent!");
      queryClient.invalidateQueries({ queryKey: ["friendshipStatus", friendId] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["lessonRequestStatus", friendId] });
    },
    onError: (err: Error) => {
      alert(err.message);
    },
  });

  // Create lesson request mutation
  const createLessonRequestMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/lesson-requests`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipientId: friendId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to send lesson request");
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessonRequestStatus", friendId] });
      // Invalidate lesson requests so recipient sees the new request
      queryClient.invalidateQueries({ queryKey: ["lessonRequests"] });
    },
    onError: (err: Error) => {
      alert(err.message);
    },
  });

  // Cancel lesson request mutation
  const cancelLessonRequestMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/lesson-requests`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ recipientId: friendId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to cancel lesson request");
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessonRequestStatus", friendId] });
    },
    onError: (err: Error) => {
      alert(err.message);
    },
  });

  // Remove friend mutation
  const removeFriendMutation = useMutation({
    mutationFn: async () => {
      if (!friendshipStatus?.friendshipId) {
        throw new Error("No friendship to remove");
      }

      const token = await getToken();
      const res = await fetch(
        `${BACKEND_URL}/friendships/${friendshipStatus.friendshipId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to remove friend");
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendshipStatus", friendId] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      navigate("/profile/friends");
    },
    onError: (err: Error) => {
      alert(err.message);
    },
  });

  const handleFriendshipAction = () => {
    if (friendshipStatus?.isFriend) {
      if (confirm("Are you sure you want to remove this friend?")) {
        removeFriendMutation.mutate();
      }
    } else {
      sendRequestMutation.mutate();
    }
  };

  const getUserDisplayName = () => {
    if (!friendProfile) return "Loading...";
    if (friendProfile.username) return friendProfile.username;
    if (friendProfile.firstName || friendProfile.lastName) {
      return `${friendProfile.firstName || ""} ${friendProfile.lastName || ""}`.trim();
    }
    return friendProfile.email;
  };

  const getIndustryName = () => {
    if (!friendProfile?.industryId) return "Not set";
    return industryIdToName[friendProfile.industryId] || "Not set";
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="friend-profile-page">
      {/* Header */}
      <div className="friend-profile-header">
        <button
          className="friend-profile-back-button"
          onClick={() => {
            // Use location state if available, otherwise default to leaderboard
            const from = (location.state as { from?: string })?.from;
            if (from) {
              navigate(from);
            } else {
              navigate("/leaderboard");
            }
          }}
        >
          <img src={goBackIcon} alt="Back" />
        </button>
        {isOwnProfile ? (
          <button
            className="friend-profile-friendship-button friend-profile-friendship-button--own"
            onClick={() => navigate('/profile')}
          >
            Your Profile
          </button>
        ) : (
          friendshipStatus && friendshipStatus.isFriend && (
            <button
              className="friend-profile-friendship-button friend-profile-friendship-button--remove"
              onClick={handleFriendshipAction}
              disabled={sendRequestMutation.isPending || removeFriendMutation.isPending}
            >
              {removeFriendMutation.isPending ? "..." : "Remove Friend"}
            </button>
          )
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="friend-profile-loading">Loading profile...</div>
      )}

      {/* Error State */}
      {error && (
        <div className="friend-profile-error">
          Failed to load profile. Please try again.
        </div>
      )}

      {/* Blocked State */}
      {friendProfile && friendshipStatus?.isBlocked && !isOwnProfile && (
        <div className="friend-profile-not-friends">
          <div className="friend-profile-not-friends-content">
            <div className="friend-profile-avatar">
              <img src={rockyWhiteLogo} alt="User Avatar" />
            </div>
            <h2 className="friend-profile-name">{getUserDisplayName()}</h2>
            <p className="friend-profile-not-friends-message">
              This user is blocked
            </p>
          </div>
        </div>
      )}

      {/* Profile Content - Show if not blocked (friends, not friends, or own profile) */}
      {friendProfile && !friendshipStatus?.isBlocked && (
        <>
          {/* Profile Card */}
          <div className="friend-profile-card">
            <div className="friend-profile-avatar">
              <img src={rockyWhiteLogo} alt="User Avatar" />
            </div>
            <h2 className="friend-profile-name">{getUserDisplayName()}</h2>
            <p className="friend-profile-industry">{getIndustryName()}</p>

            {/* Stats */}
            <div className="friend-profile-stats">
              <div className="friend-profile-stat">
                <div className="friend-profile-stat-value">
                  {followerCountData?.count ?? 0}
                </div>
                <div className="friend-profile-stat-label">Followers</div>
              </div>
              <div className="friend-profile-stat">
                <div className="friend-profile-stat-value">
                  {followingCountData?.count ?? 0}
                </div>
                <div className="friend-profile-stat-label">Followings</div>
              </div>
              <div className="friend-profile-stat">
                <div className="friend-profile-stat-value">
                  {quizCountData?.count ?? 0}
                </div>
                <div className="friend-profile-stat-label">Lessons</div>
              </div>
            </div>
          </div>

          {/* Lessons Section */}
          <div className="friend-profile-section">
            <h3 className="friend-profile-section-title">
              {getUserDisplayName()}'s Lessons
            </h3>
            {/* Show different states based on friendship status */}
            {isOwnProfile ? (
              // Own profile - show lessons
              friendQuizzes.length === 0 ? (
                <div className="friend-profile-no-lessons">
                  {getUserDisplayName()} hasn't created any lessons yet.
                </div>
              ) : (
                <div className="friend-profile-lessons-list">
                  {friendQuizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="friend-profile-lesson-list-item"
                      onClick={() => navigate(`/profile/friends/${friendId}/lessons/${quiz.id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <span className="friend-profile-lesson-list-name">
                        {quiz.name}
                      </span>
                    </div>
                  ))}
                </div>
              )
            ) : friendshipStatus ? (
              // If following but not friends (pending approval)
              friendshipStatus.isFollowing && !friendshipStatus.isFriend ? (
                <div className="friend-profile-no-lessons">
                  <p className="friend-profile-lessons-message">
                    Waiting for {getUserDisplayName()} to accept your friend request
                  </p>
                </div>
              ) : 
              // If not following at all
              !friendshipStatus.isFollowing ? (
                <div className="friend-profile-no-lessons">
                  <p className="friend-profile-lessons-message">
                    Add {getUserDisplayName()} as a friend to request their lessons
                  </p>
                  <button
                    className="friend-profile-friendship-button friend-profile-friendship-button--add"
                    onClick={handleFriendshipAction}
                    disabled={sendRequestMutation.isPending}
                  >
                    {sendRequestMutation.isPending ? "..." : "Send Friend Request"}
                  </button>
                </div>
              ) : (
                // If friends (mutual follow)
                lessonRequestStatus?.hasAccess ? (
                  // Has access - show lessons
                  friendQuizzes.length === 0 ? (
                    <div className="friend-profile-no-lessons">
                      {getUserDisplayName()} hasn't created any lessons yet.
                    </div>
                  ) : (
                    <div className="friend-profile-lessons-list">
                      {friendQuizzes.map((quiz) => (
                        <div
                          key={quiz.id}
                          className="friend-profile-lesson-list-item"
                          onClick={() => navigate(`/profile/friends/${friendId}/lessons/${quiz.id}`)}
                          style={{ cursor: "pointer" }}
                        >
                          <span className="friend-profile-lesson-list-name">
                            {quiz.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                ) : lessonRequestStatus?.status === "PENDING" ? (
                  // Request pending - show cancel button
                  <div className="friend-profile-no-lessons">
                    <p className="friend-profile-lessons-message">
                      Request to see all of {getUserDisplayName()}'s current lessons
                    </p>
                    <button
                      className="friend-profile-friendship-button friend-profile-friendship-button--remove"
                      onClick={() => cancelLessonRequestMutation.mutate()}
                      disabled={cancelLessonRequestMutation.isPending}
                    >
                      {cancelLessonRequestMutation.isPending ? "..." : "Cancel Request"}
                    </button>
                  </div>
                ) : (
                  // No request or denied - show request button
                  <div className="friend-profile-no-lessons">
                    <p className="friend-profile-lessons-message">
                      Request to see all of {getUserDisplayName()}'s current lessons
                    </p>
                    <button
                      className="friend-profile-friendship-button friend-profile-friendship-button--add"
                      onClick={() => createLessonRequestMutation.mutate()}
                      disabled={createLessonRequestMutation.isPending}
                    >
                      {createLessonRequestMutation.isPending ? "..." : "Request"}
                    </button>
                  </div>
                )
              )
            ) : (
              // Loading state - show default "not following" message
              <div className="friend-profile-no-lessons">
                <p className="friend-profile-lessons-message">
                  Add {getUserDisplayName()} as a friend to request their lessons
                </p>
                <button
                  className="friend-profile-friendship-button friend-profile-friendship-button--add"
                  onClick={handleFriendshipAction}
                  disabled={sendRequestMutation.isPending}
                >
                  {sendRequestMutation.isPending ? "..." : "Send Friend Request"}
                </button>
              </div>
            )}
          </div>

          {/* Overview Section */}
          <div className="friend-profile-section">
            <h3 className="friend-profile-section-title">Overview</h3>
            <div className="friend-profile-overview">
              <div className="friend-profile-overview-item">
                <div className="friend-profile-overview-icon"></div>
                <p className="friend-profile-overview-label">Badges:</p>
              </div>
              <div className="friend-profile-overview-item">
                <div className="friend-profile-overview-icon"></div>
                <p className="friend-profile-overview-label">Joined: {formatDate(friendProfile?.createdAt)}</p>
              </div>
              <div className="friend-profile-overview-item">
                <div className="friend-profile-overview-icon"></div>
                <p className="friend-profile-overview-label">Medals: 0</p>
              </div>
            </div>
          </div>

          {/* Connect With Me Section */}
          {/* <div className="friend-profile-section">
            <h3 className="friend-profile-section-title">Connect With Me</h3>
            <div className="friend-profile-social">
              <button className="friend-profile-social-button"></button>
              <button className="friend-profile-social-button"></button>
              <button className="friend-profile-social-button"></button>
              <button className="friend-profile-social-button"></button>
            </div>
            <div className="friend-profile-actions">
              <button className="friend-profile-action-link">
                Report User 🚩
              </button>
              <button className="friend-profile-action-link">
                Block User 🚫
              </button>
            </div>
          </div> */}
        </>
      )}
    </div>
  );
}
