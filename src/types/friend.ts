// Friendship status constants
export const FriendshipStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  BLOCKED: "BLOCKED",
  FOLLOWING: "FOLLOWING",
} as const;

export type FriendshipStatusType = typeof FriendshipStatus[keyof typeof FriendshipStatus];

export interface Friend {
  friendshipId: string | null;
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  score: number;
  industryId?: number | null;
  status?: FriendshipStatusType | string; // Optional for backward compatibility
}

export interface PendingRequest extends Friend {
  createdAt: string;
}

export interface SearchResult extends Friend {
  friendshipStatus: string;
  friendshipId: string | null;
}

export interface FriendProfile {
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  score: number;
  industryId: number | null;
  defaultPrivacy?: string;
  createdAt?: string;
}

export interface FriendQuiz {
  id: string;
  name: string;
  isLocked?: boolean;
}

// API Response interfaces
export interface FriendsResponse {
  data: Friend[];
}

export interface SearchResponse {
  data: SearchResult[];
}

// Utility function to get display name
export function getUserDisplayName(user: {
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string;
}): string {
  if (user.username) return user.username;
  if (user.firstName || user.lastName) {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  }
  return user.email || 'Unknown User';
}