import { useAuth } from "@clerk/clerk-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BACKEND_URL } from "../../lib/api";
import { FriendshipStatus } from "../../types/friend";
import type { FriendProfile, FriendQuiz } from "../../types/friend";
import type { UserBadge } from "../../types/badge";
import "../../styles/pages/_friendProfile.scss";
import LoadingBar from "../../components/LoadingBar";
import FriendLessonsSection from "../../components/FriendLessonsSection";
import PendingAccessRequestsBanner from "../../components/PendingAccessRequestsBanner";
import ProfileHeader from "../../components/ProfileHeader";
import ProfileCard from "../../components/ProfileCard";
import ProfileOverview from "../../components/ProfileOverview";
import { getUserDisplayName, getIndustryName, formatDate } from "../../utils/userHelpers";
import { useFriendshipActions } from "../../hooks/useFriendshipActions";
import { useQuizAccessRequests } from "../../hooks/useQuizAccessRequests";
import { useNotificationContext } from "../../contexts/NotificationContext";

export default function FriendProfilePage() {
  const { friendId } = useParams<{ friendId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getToken } = useAuth();
  const { showToast } = useNotificationContext();

  // Fetch current user's profile to check if viewing own profile
  const { data: currentUserProfile, isLoading: isLoadingCurrentUser } = useQuery({
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
  const { data: followerCountData, isLoading: isLoadingFollowerCount } = useQuery({
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
  const { data: followingCountData, isLoading: isLoadingFollowingCount } = useQuery({
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
    enabled: !!friendId && !!currentUserProfile && !isOwnProfile,
  });

  // Fetch friend's quiz count (all custom quizzes they created)
  const { data: quizCountData, isLoading: isLoadingQuizCount } = useQuery({
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
  const { data: userBadges, isLoading: isLoadingBadges } = useQuery({
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


  // Check friendship status
  const { data: friendshipStatus, isLoading: isLoadingFriendship } = useQuery({
    queryKey: ["friendshipStatus", friendId],
    queryFn: async (): Promise<{
      isFriend: boolean;
      isFollowing: boolean;
      friendshipId: string | null;
      status?: string;
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
      const isMutual = friend?.isMutual || false;

      // isFollowing = true if you're following them (status is FOLLOWING)
      const isFollowing = !!friend && status === FriendshipStatus.FOLLOWING;

      return {
        isFriend: !!friend && isMutual, // Friends = mutual followers
        isFollowing,
        friendshipId: friend?.friendshipId || null,
        status: status || null,
      };
    },
    enabled: !!friendId && !!currentUserProfile && !isOwnProfile,
  });

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
        console.log('📋 Pending requests response:', data);
        return data.data || [];
      }

      console.log('❌ Failed to fetch pending requests:', res.status);
      return [];
    },
    enabled: !!friendId && !!currentUserProfile && !isOwnProfile,
    refetchInterval: 5000, // Refetch every 5 seconds to catch new requests
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
    enabled: !!friendId && !!currentUserProfile && !isOwnProfile,
  });

  // Use shared hooks for all mutations
  const friendDisplayName = getUserDisplayName(friendProfile);

  const { sendRequestMutation, removeFriendMutation } = useFriendshipActions({
    friendId,
    friendName: friendDisplayName,
    navigateOnRemove: true,
  });

  const { approveQuizAccessMutation, denyQuizAccessMutation } = useQuizAccessRequests({
    friendId,
    friendName: friendDisplayName,
  });

  const handleFriendshipAction = () => {
    // If following (one-way) or friends (mutual), unfollow/remove directly
    if (friendshipStatus?.isFriend || friendshipStatus?.isFollowing) {
      removeFriendMutation.mutate(friendshipStatus.friendshipId!);
    } else {
      // Not following yet, send follow request
      sendRequestMutation.mutate(friendId!);
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
          showToast({
            id: `error-${Date.now()}`,
            type: "ERROR",
            title: "No Document",
            message: "This lesson doesn't have an associated document.",
            isRead: false,
            createdAt: new Date().toISOString(),
            userId: "",
            actionUrl: undefined,
          });
        }
      } else {
        showToast({
          id: `error-${Date.now()}`,
          type: "ERROR",
          title: "Load Failed",
          message: "Failed to load lesson details.",
          isRead: false,
          createdAt: new Date().toISOString(),
          userId: "",
          actionUrl: undefined,
        });
      }
    } catch (error) {
      console.error("Error fetching lesson details:", error);
      showToast({
        id: `error-${Date.now()}`,
        type: "ERROR",
        title: "Load Failed",
        message: "Failed to load lesson details.",
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: "",
        actionUrl: undefined,
      });
    }
  };

  // Combine all loading states to prevent flickering
  const isLoadingData =
    isLoadingCurrentUser ||
    isLoading ||
    isLoadingFollowerCount ||
    isLoadingFollowingCount ||
    isLoadingQuizCount ||
    isLoadingBadges ||
    isLoadingQuizzes ||
    (isOwnProfile ? false : isLoadingMyRequests) ||
    (isOwnProfile ? false : isLoadingFriendship);

  return (
    <div className="container container--friend-profile">
      <div className="friend-profile-page">
      {/* Header - only show after key data is loaded to prevent flicker */}
      {!isLoadingData && (
        <ProfileHeader
          from={(location.state as { from?: string })?.from}
          isOwnProfile={isOwnProfile}
          isFriend={friendshipStatus?.isFriend || false}
          isFollowing={friendshipStatus?.isFollowing || false}
          onFriendshipAction={handleFriendshipAction}
          isSendRequestPending={sendRequestMutation.isPending}
          isRemoveFriendPending={removeFriendMutation.isPending}
        />
      )}

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

      {/* Profile Content */}
      {!isLoadingData && friendProfile && (
        <>
          {/* Profile Card */}
          <ProfileCard
            displayName={getUserDisplayName(friendProfile)}
            industryName={getIndustryName(friendProfile?.industryId)}
            followerCount={followerCountData?.count ?? 0}
            followingCount={followingCountData?.count ?? 0}
            lessonCount={quizCountData?.count ?? 0}
            avatar={friendProfile?.avatar}
          />

          {/* Pending Access Requests Banner */}
          {!isOwnProfile && (
            <PendingAccessRequestsBanner
              requesterName={getUserDisplayName(friendProfile)}
              requests={pendingRequests}
              onApprove={(quizId) => approveQuizAccessMutation.mutate(quizId)}
              onDeny={(quizId) => denyQuizAccessMutation.mutate(quizId)}
              isApproving={approveQuizAccessMutation.isPending}
              isDenying={denyQuizAccessMutation.isPending}
            />
          )}

          {/* Lessons Section */}
          <FriendLessonsSection
            friendId={friendId!}
            friendProfile={friendProfile}
            friendQuizzes={friendQuizzes}
            friendshipStatus={friendshipStatus}
            myRequestedQuizIds={myRequestedQuizIds}
            isOwnProfile={isOwnProfile}
            getUserDisplayName={() => getUserDisplayName(friendProfile)}
            handleFriendshipAction={handleFriendshipAction}
            sendRequestMutationPending={sendRequestMutation.isPending}
            onLessonClick={handleLessonClick}
          />

          {/* Overview Section */}
          <ProfileOverview
            badgeCount={userBadges?.length || 0}
            joinedDate={formatDate(friendProfile?.createdAt)}
          />
        </>
      )}
      </div>
    </div>
  );
}
