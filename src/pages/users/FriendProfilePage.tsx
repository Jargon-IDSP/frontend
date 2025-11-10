import { useAuth } from "@clerk/clerk-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BACKEND_URL } from "../../lib/api";
import { FriendshipStatus } from "../../types/friend";
import type { FriendProfile, FriendQuiz } from "../../types/friend";
import "../../styles/pages/_friendProfile.scss";
import goBackIcon from "../../assets/icons/goBackIcon.svg";
import lockIcon from "../../assets/icons/lockIcon.svg";
import rockyWhiteLogo from "/rockyWhite.svg";
import { useMemo, useEffect } from "react";
import { useNotificationContext } from "../../contexts/NotificationContext";
import LoadingBar from "../../components/LoadingBar";

// Eagerly import all badge images using glob
const badgeModules = import.meta.glob<string>('../../assets/badges/**/*.svg', {
  eager: true,
  import: 'default'
});

const industryIdToName: { [key: number]: string } = {
  1: "Electrician",
  2: "Plumber",
  3: "Carpenter",
  4: "Mechanic",
  5: "Welder",
};

interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  iconUrl: string | null;
  levelId: number | null;
  industryId: number | null;
}

interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
  badge: Badge;
}

export default function FriendProfilePage() {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useNotificationContext();

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
      let res = await fetch(`${BACKEND_URL}/api/users/${friendId}`, {
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

  // Fetch user badges
  const { data: userBadges } = useQuery({
    queryKey: ["userBadges", friendId],
    queryFn: async (): Promise<UserBadge[]> => {
      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/prebuilt-quizzes/users/${friendId}/badges`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.badges || [];
    },
    enabled: !!friendId,
  });

  // Get badge icon URLs from glob imports
  const badgeIcons = useMemo(() => {
    if (!userBadges) return [];

    return userBadges.map((userBadge) => {
      if (userBadge.badge?.iconUrl) {
        const iconPath = userBadge.badge.iconUrl;
        const fullPath = `../../assets/badges/${iconPath}`;
        const url = badgeModules[fullPath];
        return {
          id: userBadge.id,
          name: userBadge.badge.name,
          url: url || null
        };
      }
      return null;
    }).filter((icon): icon is { id: string; name: string; url: string } => icon !== null && icon.url !== null);
  }, [userBadges]);

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
  // Always fetch - backend will handle privacy logic
  const { data: friendQuizzes = [], isLoading: isLoadingQuizzes } = useQuery({
    queryKey: ["friendLessons", friendId, lessonRequestStatus?.hasAccess, friendProfile?.defaultPrivacy, friendshipStatus?.isFriend],
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
        console.log("Friend lessons fetched:", data.data);
        return data.data || [];
      }

      console.log("Failed to fetch friend lessons:", res.status);
      return [];
    },
    enabled: !!friendId, // Always fetch - let backend handle privacy
  });

  // Fetch pending quiz access requests (when viewing someone who requested access to your quizzes)
  const { data: pendingRequests = [] } = useQuery({
    queryKey: ["pendingRequests", friendId],
    queryFn: async () => {
      if (!friendId) return [];

      const token = await getToken();
      const res = await fetch(
        `${BACKEND_URL}/quiz-shares/pending-requests/${friendId}`,
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
    enabled: !!friendId && !isOwnProfile,
  });

  // Fetch quiz IDs that current user has requested access to from this friend
  const { data: myRequestedQuizIds = [], isLoading: isLoadingMyRequests } = useQuery({
    queryKey: ["myRequests", friendId],
    queryFn: async () => {
      if (!friendId) return [];

      const token = await getToken();
      const res = await fetch(
        `${BACKEND_URL}/quiz-shares/my-requests/${friendId}`,
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
    enabled: !!friendId && !isOwnProfile,
  });

  // Debug logging
  useEffect(() => {
    console.log('🔍 Privacy Debug:', {
      defaultPrivacy: friendProfile?.defaultPrivacy,
      isOwnProfile,
      friendQuizzesLength: friendQuizzes.length,
      friendshipStatus,
      friendQuizzes,
      pendingRequests
    });
  }, [friendProfile?.defaultPrivacy, isOwnProfile, friendQuizzes.length, friendshipStatus, friendQuizzes, pendingRequests]);

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
      queryClient.invalidateQueries({ queryKey: ["friendshipStatus", friendId] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["lessonRequestStatus", friendId] });
      showToast({
        id: `follow-${Date.now()}`,
        type: "SUCCESS" as any,
        title: "Success",
        message: `You are now following ${getUserDisplayName()}`,
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: "",
        actionUrl: undefined,
      });
    },
    onError: (err: Error) => {
      showToast({
        id: `error-${Date.now()}`,
        type: "ERROR" as any,
        title: "Error",
        message: err.message,
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: "",
        actionUrl: undefined,
      });
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
      showToast({
        id: `lesson-request-${Date.now()}`,
        type: "SUCCESS" as any,
        title: "Request Sent",
        message: `Lesson request sent to ${getUserDisplayName()}`,
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: "",
        actionUrl: undefined,
      });
    },
    onError: (err: Error) => {
      showToast({
        id: `error-${Date.now()}`,
        type: "ERROR" as any,
        title: "Error",
        message: err.message,
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: "",
        actionUrl: undefined,
      });
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
      showToast({
        id: `cancel-request-${Date.now()}`,
        type: "SUCCESS" as any,
        title: "Request Cancelled",
        message: `Lesson request cancelled`,
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: "",
        actionUrl: undefined,
      });
    },
    onError: (err: Error) => {
      showToast({
        id: `error-${Date.now()}`,
        type: "ERROR" as any,
        title: "Error",
        message: err.message,
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: "",
        actionUrl: undefined,
      });
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
        throw new Error("Failed to unfollow friend");
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendshipStatus", friendId] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      showToast({
        id: `unfollow-${Date.now()}`,
        type: "SUCCESS" as any,
        title: "Success",
        message: `You have unfollowed ${getUserDisplayName()}`,
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: "",
        actionUrl: undefined,
      });
      navigate("/profile/friends");
    },
    onError: (err: Error) => {
      showToast({
        id: `error-${Date.now()}`,
        type: "ERROR" as any,
        title: "Error",
        message: err.message,
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: "",
        actionUrl: undefined,
      });
    },
  });

  // Request quiz access mutation
  const requestQuizAccessMutation = useMutation({
    mutationFn: async (quizId: string) => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/quiz-shares/request-access`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customQuizId: quizId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to request quiz access");
      }

      return await res.json();
    },
    onMutate: async (quizId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["myRequests", friendId] });

      // Snapshot previous value
      const previousRequests = queryClient.getQueryData(["myRequests", friendId]);

      // Optimistically add this quiz ID to the requested list
      queryClient.setQueryData(["myRequests", friendId], (old: any) => {
        if (!old) return [quizId];
        return [...old, quizId];
      });

      // Return context with snapshot
      return { previousRequests };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendQuizzes", friendId] });
      queryClient.invalidateQueries({ queryKey: ["myRequests", friendId] });
      showToast({
        id: `quiz-access-request-${Date.now()}`,
        type: "SUCCESS" as any,
        title: "Request Sent",
        message: `Access request sent to ${getUserDisplayName()}`,
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: "",
        actionUrl: undefined,
      });
    },
    onError: (err: Error, quizId: string, context: any) => {
      // Rollback on error
      if (context?.previousRequests) {
        queryClient.setQueryData(["myRequests", friendId], context.previousRequests);
      }
      showToast({
        id: `error-${Date.now()}`,
        type: "ERROR" as any,
        title: "Error",
        message: err.message,
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: "",
        actionUrl: undefined,
      });
    },
  });

  // Approve quiz access request mutation
  const approveQuizAccessMutation = useMutation({
    mutationFn: async (quizId: string) => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/quiz-shares`, {
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

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to approve request");
      }

      return await res.json();
    },
    onMutate: async (quizId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["pendingRequests", friendId] });
      await queryClient.cancelQueries({ queryKey: ["myRequests", friendId] });

      // Snapshot previous values
      const previousRequests = queryClient.getQueryData(["pendingRequests", friendId]);
      const previousMyRequests = queryClient.getQueryData(["myRequests", friendId]);

      // Optimistically remove the pending request
      queryClient.setQueryData(["pendingRequests", friendId], (old: any) => {
        if (!old) return [];
        return old.filter((req: any) => req.quizId !== quizId);
      });

      // Optimistically remove from myRequests (for the requester viewing the owner's profile)
      queryClient.setQueryData(["myRequests", friendId], (old: any) => {
        if (!old) return [];
        return old.filter((id: string) => id !== quizId);
      });

      // Return context with snapshots
      return { previousRequests, previousMyRequests };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingRequests", friendId] });
      queryClient.invalidateQueries({ queryKey: ["friendQuizzes", friendId] });
      queryClient.invalidateQueries({ queryKey: ["myRequests", friendId] });
      showToast({
        id: `approve-${Date.now()}`,
        type: "SUCCESS" as any,
        title: "Access Granted",
        message: `${getUserDisplayName()} now has access to the lesson`,
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: "",
        actionUrl: undefined,
      });
    },
    onError: (err: Error, quizId: string, context: any) => {
      // Rollback on error
      if (context?.previousRequests) {
        queryClient.setQueryData(["pendingRequests", friendId], context.previousRequests);
      }
      if (context?.previousMyRequests) {
        queryClient.setQueryData(["myRequests", friendId], context.previousMyRequests);
      }
      showToast({
        id: `error-${Date.now()}`,
        type: "ERROR" as any,
        title: "Error",
        message: err.message,
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: "",
        actionUrl: undefined,
      });
    },
  });

  // Deny quiz access request mutation
  const denyQuizAccessMutation = useMutation({
    mutationFn: async (quizId: string) => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/quiz-shares/deny-access`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customQuizId: quizId,
          requesterId: friendId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to deny request");
      }

      return await res.json();
    },
    onMutate: async (quizId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["pendingRequests", friendId] });

      // Snapshot previous value
      const previousRequests = queryClient.getQueryData(["pendingRequests", friendId]);

      // Optimistically update to remove the request
      queryClient.setQueryData(["pendingRequests", friendId], (old: any) => {
        if (!old) return [];
        return old.filter((req: any) => req.quizId !== quizId);
      });

      // Return context with snapshot
      return { previousRequests };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingRequests", friendId] });
      showToast({
        id: `deny-${Date.now()}`,
        type: "SUCCESS" as any,
        title: "Request Denied",
        message: `Access request denied`,
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: "",
        actionUrl: undefined,
      });
    },
    onError: (err: Error, quizId: string, context: any) => {
      // Rollback on error
      if (context?.previousRequests) {
        queryClient.setQueryData(["pendingRequests", friendId], context.previousRequests);
      }
      showToast({
        id: `error-${Date.now()}`,
        type: "ERROR" as any,
        title: "Error",
        message: err.message,
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: "",
        actionUrl: undefined,
      });
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

  const handleLessonClick = async (lessonId: string) => {
    try {
      const token = await getToken();
      // Fetch lesson details to get documentId
      const res = await fetch(
        `${BACKEND_URL}/learning/custom/users/${friendId}/lessons/${lessonId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        const lesson = data.data;

        if (lesson?.documentId) {
          // Navigate to study page with location state indicating it's a friend's lesson
          navigate(`/learning/documents/${lesson.documentId}/study`, {
            state: { isFriendLesson: true, friendId },
          });
        } else {
          alert("This lesson doesn't have an associated document.");
        }
      } else {
        alert("Failed to load lesson details.");
      }
    } catch (error) {
      console.error("Error fetching lesson details:", error);
      alert("Failed to load lesson details.");
    }
  };

  // Combine all loading states to prevent flickering
  const isLoadingData = isLoading || isLoadingQuizzes || (isOwnProfile ? false : isLoadingMyRequests);

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
          friendshipStatus && (
            <button
              className={`friend-profile-friendship-button ${
                friendshipStatus.isFriend
                  ? "friend-profile-friendship-button--remove"
                  : "friend-profile-friendship-button--add"
              }`}
              onClick={handleFriendshipAction}
              disabled={sendRequestMutation.isPending || removeFriendMutation.isPending}
            >
              {friendshipStatus.isFriend
                ? (removeFriendMutation.isPending ? "..." : "Unfollow")
                : (sendRequestMutation.isPending ? "..." : "Follow")
              }
            </button>
          )
        )}
      </div>

      {/* Loading State */}
      <LoadingBar
        isLoading={isLoadingData}
        hasData={!!friendProfile && !isLoadingData}
        text="Loading profile"
      />

      {/* Error State */}
      {!isLoadingData && error && (
        <div className="friend-profile-error">
          Failed to load profile. Please try again.
        </div>
      )}

      {/* Blocked State */}
      {!isLoadingData && friendProfile && friendshipStatus?.isBlocked && !isOwnProfile && (
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
      {!isLoadingData && friendProfile && !friendshipStatus?.isBlocked && (
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

          {/* Pending Access Requests Banner */}
          {!isOwnProfile && pendingRequests.length > 0 && (
            <div className="friend-profile-pending-requests-banner">
              <h3 className="friend-profile-pending-requests-title">
                Pending Access Requests
              </h3>
              <p className="friend-profile-pending-requests-message">
                {getUserDisplayName()} has requested access to the following lessons:
              </p>
              <div className="friend-profile-pending-requests-list">
                {pendingRequests.map((request: any) => (
                  <div
                    key={request.quizId}
                    className="friend-profile-pending-request-item"
                  >
                    <span className="friend-profile-pending-request-name">{request.quizName}</span>
                    <div className="friend-profile-pending-request-actions">
                      <button
                        onClick={() => approveQuizAccessMutation.mutate(request.quizId)}
                        disabled={approveQuizAccessMutation.isPending}
                        className="friend-profile-request-button friend-profile-request-button--approve"
                      >
                        {approveQuizAccessMutation.isPending ? "..." : "Approve"}
                      </button>
                      <button
                        onClick={() => denyQuizAccessMutation.mutate(request.quizId)}
                        disabled={denyQuizAccessMutation.isPending}
                        className="friend-profile-request-button friend-profile-request-button--deny"
                      >
                        {denyQuizAccessMutation.isPending ? "..." : "Deny"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lessons Section */}
          <div className="friend-profile-section">
            <h3 className="friend-profile-section-title">
              {getUserDisplayName()}'s Lessons
            </h3>
            {/* Show different states based on privacy settings and friendship status */}
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
                      onClick={() => handleLessonClick(quiz.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <span className="friend-profile-lesson-list-name">
                        {quiz.name}
                      </span>
                    </div>
                  ))}
                </div>
              )
            ) : friendProfile?.defaultPrivacy === "PUBLIC" ? (
              // PUBLIC privacy - everyone can see lessons
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
                      onClick={() => handleLessonClick(quiz.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <span className="friend-profile-lesson-list-name">
                        {quiz.name}
                      </span>
                    </div>
                  ))}
                </div>
              )
            ) : friendProfile?.defaultPrivacy === "FRIENDS" ? (
              // FRIENDS privacy - check if they are mutual friends
              friendshipStatus?.isFriend ? (
                // They are friends - show lessons
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
                        onClick={() => handleLessonClick(quiz.id)}
                        style={{ cursor: "pointer" }}
                      >
                        <span className="friend-profile-lesson-list-name">
                          {quiz.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              ) : friendshipStatus?.isFollowing && !friendshipStatus.isFriend ? (
                // Pending friend request
                <div className="friend-profile-no-lessons">
                  <p className="friend-profile-lessons-message">
                    Waiting for {getUserDisplayName()} to accept your friend request
                  </p>
                </div>
              ) : (
                // Not friends - prompt to follow
                <div className="friend-profile-no-lessons">
                  <p className="friend-profile-lessons-message">
                    Follow {getUserDisplayName()} to view their lessons
                  </p>
                  <button
                    className="friend-profile-friendship-button friend-profile-friendship-button--add"
                    onClick={handleFriendshipAction}
                    disabled={sendRequestMutation.isPending}
                  >
                    {sendRequestMutation.isPending ? "..." : "Follow"}
                  </button>
                </div>
              )
            ) : friendProfile?.defaultPrivacy === "PRIVATE" ? (
              // PRIVATE privacy - behavior depends on friendship status
              friendshipStatus?.isFriend ? (
                // They are friends - show all lessons with lock icons for lessons that need access request
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
                        onClick={() => !quiz.isLocked && handleLessonClick(quiz.id)}
                        style={{ cursor: quiz.isLocked ? "default" : "pointer" }}
                      >
                        <span className="friend-profile-lesson-list-name">
                          {quiz.name}
                        </span>
                        {/* Show lock icon or request pending status for locked lessons */}
                        {quiz.isLocked && (
                          myRequestedQuizIds.includes(quiz.id) ? (
                            <span className="friend-profile-lesson-request-pending">
                              Request Pending
                            </span>
                          ) : (
                            <img
                              src={lockIcon}
                              alt="Locked"
                              className="friend-profile-lesson-lock"
                              onClick={(e) => {
                                e.stopPropagation();
                                requestQuizAccessMutation.mutate(quiz.id);
                              }}
                            />
                          )
                        )}
                      </div>
                    ))}
                  </div>
                )
              ) : friendshipStatus?.isFollowing && !friendshipStatus.isFriend ? (
                // Pending friend request
                <div className="friend-profile-no-lessons">
                  <p className="friend-profile-lessons-message">
                    Waiting for {getUserDisplayName()} to accept your friend request
                  </p>
                </div>
              ) : (
                // Not friends - show follow message with button
                <div className="friend-profile-no-lessons">
                  <p className="friend-profile-lessons-message">
                    Follow {getUserDisplayName()} to view their lessons
                  </p>
                  <button
                    className="friend-profile-friendship-button friend-profile-friendship-button--add"
                    onClick={handleFriendshipAction}
                    disabled={sendRequestMutation.isPending}
                  >
                    {sendRequestMutation.isPending ? "..." : "Follow"}
                  </button>
                </div>
              )
            ) : (
              // Loading state or unknown privacy setting
              <div className="friend-profile-no-lessons">
                <p className="friend-profile-lessons-message">
                  Loading...
                </p>
              </div>
            )}
          </div>

          {/* Overview Section */}
          <div className="friend-profile-section">
            <h3 className="friend-profile-section-title">Overview</h3>
            <div className="friend-profile-overview">
              <div className="friend-profile-overview-item">
                <p className="friend-profile-overview-label">Badges: {userBadges?.length || 0}</p>
              </div>
              <div className="friend-profile-overview-item">
                <p className="friend-profile-overview-label">Joined: {formatDate(friendProfile?.createdAt)}</p>
              </div>
            </div>

            {/* Badges Display */}
            <div className="friend-profile-badges-section">
              <h4 className="friend-profile-badges-subtitle">Badge Collection</h4>
              <div className="friend-profile-badges-grid">
                {badgeIcons.length > 0 ? (
                  badgeIcons.map((badge) => (
                    <div key={badge.id} className="friend-profile-badge-item" title={badge.name}>
                      <img
                        src={badge.url}
                        alt={badge.name}
                        className="friend-profile-badge-icon"
                      />
                    </div>
                  ))
                ) : (
                  <p className="friend-profile-no-badges">No badges earned yet.</p>
                )}
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
