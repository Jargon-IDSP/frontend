/**
 * Shared type definitions for custom hooks
 */

export interface UseFriendshipActionsOptions {
  friendId?: string;
  friendName?: string;
  navigateOnRemove?: boolean;
}

export interface UseLessonRequestsOptions {
  friendId?: string;
  friendName?: string;
}

export interface UseQuizAccessRequestsOptions {
  friendId?: string;
  friendName?: string;
}
