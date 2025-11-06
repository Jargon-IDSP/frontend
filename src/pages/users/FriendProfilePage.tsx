import { useAuth } from "@clerk/clerk-react";
import { useNavigate, useParams } from "react-router-dom";
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
  // Add any other fields that might come from the backend
}

interface FriendQuiz {
  id: string;
  name: string;
  category: string | null;
  createdAt: string;
  _count: {
    questions: number;
  };
}

export default function FriendProfilePage() {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
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
          };
        }
      }

      throw new Error("User not found");
    },
    enabled: !!friendId,
  });

  // Fetch friend's quizzes (from shared quizzes)
  const { data: friendQuizzes = [] } = useQuery({
    queryKey: ["friendQuizzes", friendId],
    queryFn: async (): Promise<FriendQuiz[]> => {
      const token = await getToken();

      // First try the specific endpoint for user's quizzes
      let res = await fetch(
        `${BACKEND_URL}/learning/sharing/user/${friendId}/quizzes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        return data.data || [];
      }

      // If that fails, fetch all shared quizzes and filter by friend ID
      const sharedRes = await fetch(
        `${BACKEND_URL}/learning/sharing/shared-with-me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!sharedRes.ok) {
        return [];
      }

      const sharedData = await sharedRes.json();
      const allSharedQuizzes = sharedData.data || [];

      // Filter quizzes shared by this friend
      const friendSharedQuizzes = allSharedQuizzes
        .filter((shared: any) => shared.customQuiz.user.id === friendId)
        .map((shared: any) => ({
          id: shared.customQuiz.id,
          name: shared.customQuiz.name,
          category: shared.customQuiz.category,
          createdAt: shared.customQuiz.createdAt,
          _count: {
            questions: shared.customQuiz._count.questions,
          },
        }));

      return friendSharedQuizzes;
    },
    enabled: !!friendId,
  });

  // Check friendship status
  const { data: friendshipStatus } = useQuery({
    queryKey: ["friendshipStatus", friendId],
    queryFn: async (): Promise<{
      isFriend: boolean;
      friendshipId: string | null;
      status?: string;
      isBlocked?: boolean;
    }> => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/friendships`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        return { isFriend: false, friendshipId: null };
      }

      const data = await res.json();
      const friends = data.data || [];
      const friend = friends.find((f: any) => f.id === friendId);

      const status = friend?.status || FriendshipStatus.PENDING;
      const isBlocked = status === FriendshipStatus.BLOCKED;
      const isAccepted = status === FriendshipStatus.ACCEPTED || status === "ACCEPTED";

      return {
        isFriend: !!friend && isAccepted,
        friendshipId: friend?.friendshipId || null,
        status,
        isBlocked,
      };
    },
    enabled: !!friendId && !isOwnProfile,
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

  return (
    <div className="friend-profile-page">
      {/* Header */}
      <div className="friend-profile-header">
        <button
          className="friend-profile-back-button"
          onClick={() => navigate(-1)}
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

      {/* Not Friends Yet State */}
      {friendProfile && friendshipStatus && !friendshipStatus.isFriend && !friendshipStatus.isBlocked && !isOwnProfile && (
        <div className="friend-profile-not-friends">
          <div className="friend-profile-not-friends-content">
            <div className="friend-profile-avatar">
              <img src={rockyWhiteLogo} alt="User Avatar" />
            </div>
            <h2 className="friend-profile-name">{getUserDisplayName()}</h2>
            <p className="friend-profile-not-friends-message">
              You are not friends yet
            </p>
            <button
              className="friend-profile-friendship-button friend-profile-friendship-button--add"
              onClick={handleFriendshipAction}
              disabled={sendRequestMutation.isPending}
            >
              {sendRequestMutation.isPending ? "..." : "Add as Friend"}
            </button>
          </div>
        </div>
      )}

      {/* Profile Content - Show if friends OR if viewing own profile */}
      {friendProfile && (friendshipStatus?.isFriend || isOwnProfile) && (
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
                  {friendProfile.score}
                </div>
                <div className="friend-profile-stat-label">Points</div>
              </div>
              <div className="friend-profile-stat">
                <div className="friend-profile-stat-value">13</div>
                <div className="friend-profile-stat-label">Followings</div>
              </div>
              <div className="friend-profile-stat">
                <div className="friend-profile-stat-value">
                  {friendQuizzes.length}
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
            {friendQuizzes.length === 0 ? (
              <div className="friend-profile-no-lessons">
                {getUserDisplayName()} hasn't created any quizzes yet.
              </div>
            ) : (
              <>
                <div className="friend-profile-lessons">
                  {friendQuizzes.slice(0, 3).map((quiz) => (
                    <div key={quiz.id} className="friend-profile-lesson-item">
                      <div className="friend-profile-lesson-icon">
                        <div className="friend-profile-lesson-placeholder"></div>
                      </div>
                      <div className="friend-profile-lesson-info">
                        <h4 className="friend-profile-lesson-title">
                          {quiz.name}
                        </h4>
                        <p className="friend-profile-lesson-topic">
                          {quiz.category ? `Topic: ${quiz.category}` : "General"}
                        </p>
                        <p className="friend-profile-lesson-questions">
                          {quiz._count.questions} question{quiz._count.questions !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="friend-profile-lesson-actions">
                        <button
                          className="friend-profile-lesson-view"
                          onClick={() => navigate(`/learning/custom/quiz/take?quizId=${quiz.id}`)}
                          title="Take Quiz"
                        >
                          ▶
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {friendQuizzes.length > 3 && (
                  <button
                    className="friend-profile-view-more"
                    onClick={() => navigate('/learning/shared')}
                  >
                    View More <span>∨</span>
                  </button>
                )}
              </>
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
                <p className="friend-profile-overview-label">Joined:</p>
              </div>
              <div className="friend-profile-overview-item">
                <div className="friend-profile-overview-icon"></div>
                <p className="friend-profile-overview-label">Medals: 0</p>
              </div>
            </div>
          </div>

          {/* Connect With Me Section */}
          <div className="friend-profile-section">
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
          </div>
        </>
      )}
    </div>
  );
}
