import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CategoriesCard } from "./learning/CategoriesCard";
import { BACKEND_URL } from "../lib/api";
import type { FriendQuiz } from "../types/friend";
import lockIcon from "../assets/icons/lockIcon.svg";
import lessonIconWrench from "../assets/icons/lessonIconWrench.svg";
import editIconRed from "../assets/icons/editIconRed.svg";
import downArrow from "../assets/icons/downArrow.svg";
import { useNotificationContext } from "../contexts/NotificationContext";

interface FriendLessonsSectionProps {
  friendId: string;
  friendProfile: {
    defaultPrivacy?: string;
  } | null;
  friendQuizzes: FriendQuiz[];
  friendshipStatus: {
    isFriend: boolean;
    isFollowing: boolean;
  } | undefined;
  myRequestedQuizIds: string[];
  isOwnProfile: boolean;
  getUserDisplayName: () => string;
  handleFriendshipAction: () => void;
  sendRequestMutationPending: boolean;
  onLessonClick: (lessonId: string) => void;
}

// Privacy level constants for clarity
const PrivacyLevel = {
  PUBLIC: "PUBLIC",
  FRIENDS: "FRIENDS",
  PRIVATE: "PRIVATE",
} as const;

// Helper function to determine what content to show based on privacy and friendship
function getLessonDisplayMode(
  isOwnProfile: boolean,
  privacy: string | undefined,
  isFriend: boolean,
  isFollowing: boolean
): {
  mode: "show_all" | "show_locked" | "pending_request" | "prompt_follow" | "loading";
  message?: string;
} {
  // Own profile - always show all
  if (isOwnProfile) {
    return { mode: "show_all" };
  }

  // Handle each privacy level
  switch (privacy) {
    case PrivacyLevel.PUBLIC:
      // PUBLIC: Everyone can see all lessons, unlocked
      return { mode: "show_all" };

    case PrivacyLevel.FRIENDS:
      if (isFriend) {
        // FRIENDS + ARE FRIENDS: Show all lessons, unlocked
        return { mode: "show_all" };
      } else if (isFollowing) {
        // FRIENDS + PENDING REQUEST: Show prompt with pending message
        return {
          mode: "pending_request",
          message: "Waiting for {name} to follow you back",
        };
      } else {
        // FRIENDS + NOT FRIENDS: Show follow prompt
        return {
          mode: "prompt_follow",
          message: "Follow {name} to view their lessons",
        };
      }

    case PrivacyLevel.PRIVATE:
      if (isFriend) {
        // PRIVATE + ARE FRIENDS: Show all lessons with locks for unshared ones
        return { mode: "show_locked" };
      } else if (isFollowing) {
        // PRIVATE + FOLLOWING (not mutual): Show pending message
        return {
          mode: "pending_request",
          message: "Waiting for {name} to follow you back",
        };
      } else {
        // PRIVATE + NOT FRIENDS: Show follow prompt
        return {
          mode: "prompt_follow",
          message: "Follow {name} to request their lessons",
        };
      }

    default:
      // Unknown privacy setting or loading
      return {
        mode: "loading",
        message: "Loading...",
      };
  }
}

// Helper function to check if a lesson should show a lock icon
function shouldShowLockIcon(
  quiz: FriendQuiz,
  displayMode: string,
  myRequestedQuizIds: string[]
): { showLock: boolean; showPending: boolean } {
  if (displayMode !== "show_locked") {
    return { showLock: false, showPending: false };
  }

  if (!quiz.isLocked) {
    return { showLock: false, showPending: false };
  }

  const isPending = myRequestedQuizIds.includes(quiz.id);
  return {
    showLock: !isPending,
    showPending: isPending,
  };
}

export default function FriendLessonsSection({
  friendId,
  friendProfile,
  friendQuizzes,
  friendshipStatus,
  myRequestedQuizIds,
  isOwnProfile,
  getUserDisplayName,
  handleFriendshipAction,
  sendRequestMutationPending,
  onLessonClick,
}: FriendLessonsSectionProps) {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useNotificationContext();
  const [isExpanded, setIsExpanded] = useState(false);

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
      await queryClient.cancelQueries({ queryKey: ["myRequests", friendId] });
      const previousRequests = queryClient.getQueryData(["myRequests", friendId]);

      queryClient.setQueryData(["myRequests", friendId], (old: any) => {
        if (!old) return [quizId];
        return [...old, quizId];
      });

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
    onError: (err: Error, _quizId: string, context: any) => {
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

  // Determine what to display
  const displayMode = getLessonDisplayMode(
    isOwnProfile,
    friendProfile?.defaultPrivacy,
    friendshipStatus?.isFriend ?? false,
    friendshipStatus?.isFollowing ?? false
  );

  // Replace {name} placeholder with actual name
  const message = displayMode.message?.replace("{name}", getUserDisplayName());

  // Render lessons list
  const renderLessonsList = () => {
    if (friendQuizzes.length === 0) {
      return (
        <div className="friend-profile-no-lessons">
          {getUserDisplayName()} hasn't created any lessons yet.
        </div>
      );
    }

    const displayLimit = 3;
    const hasMoreLessons = friendQuizzes.length > displayLimit;
    const lessonsToShow = isExpanded ? friendQuizzes : friendQuizzes.slice(0, displayLimit);

    return (
      <div className="friend-profile-lessons-list">
        {lessonsToShow.map((quiz) => {
          const { showLock, showPending } = shouldShowLockIcon(
            quiz,
            displayMode.mode,
            myRequestedQuizIds
          );
          const isClickable = !quiz.isLocked || displayMode.mode !== "show_locked";

          return (
            <div
              key={quiz.id}
              className="friend-profile-lesson-list-item"
              onClick={() => isClickable && onLessonClick(quiz.id)}
              style={{ cursor: isClickable ? "pointer" : "default" }}
            >
              <img
                src={lessonIconWrench}
                alt="Lesson"
                className="friend-profile-lesson-wrench-icon"
              />
              <span className="friend-profile-lesson-list-name">{quiz.name}</span>

              {showPending && (
                <span className="friend-profile-lesson-request-pending">
                  Request Pending
                </span>
              )}

              {showLock && (
                <img
                  src={lockIcon}
                  alt="Locked"
                  className="friend-profile-lesson-lock"
                  onClick={(e) => {
                    e.stopPropagation();
                    requestQuizAccessMutation.mutate(quiz.id);
                  }}
                />
              )}

              {isOwnProfile && (
                <img
                  src={editIconRed}
                  alt="Edit"
                  className="friend-profile-lesson-edit-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Navigate to edit lesson page
                    const currentPath = window.location.pathname;
                    const userId = currentPath.includes("/profile/friends/") 
                      ? currentPath.split("/profile/friends/")[1] 
                      : "me";
                    navigate(`/profile/lessons/${quiz.id}/edit`, {
                      state: { 
                        from: currentPath,
                        userId: userId !== "me" ? userId : undefined,
                        lessonName: quiz.name
                      }
                    });
                  }}
                />
              )}
            </div>
          );
        })}
        {hasMoreLessons && (
          <button
            className="friend-profile-lessons-view-more"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className="friend-profile-lessons-view-more-text">
              {isExpanded ? "View Less" : "View More"}
            </span>
            <img
              src={downArrow}
              alt={isExpanded ? "Collapse" : "Expand"}
              className={`friend-profile-lessons-view-more-icon ${
                isExpanded ? "friend-profile-lessons-view-more-icon--expanded" : ""
              }`}
            />
          </button>
        )}
      </div>
    );
  };

  // Render prompt message with optional button
  const renderPrompt = () => {
    return (
      <div className="friend-profile-no-lessons">
        <p className="friend-profile-lessons-message">{message}</p>
        {displayMode.mode === "prompt_follow" && (
          <button
            className="friend-profile-friendship-button friend-profile-friendship-button--add"
            onClick={handleFriendshipAction}
            disabled={sendRequestMutationPending}
          >
            {sendRequestMutationPending ? "..." : "Follow"}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="friend-profile-section">
      <CategoriesCard title={`${getUserDisplayName()}'s Lessons`}>
        {displayMode.mode === "show_all" && renderLessonsList()}
        {displayMode.mode === "show_locked" && renderLessonsList()}
        {(displayMode.mode === "pending_request" ||
          displayMode.mode === "prompt_follow" ||
          displayMode.mode === "loading") &&
          renderPrompt()}
      </CategoriesCard>
    </div>
  );
}
