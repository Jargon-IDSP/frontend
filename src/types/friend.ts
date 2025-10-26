export interface Friend {
  friendshipId: string | null;
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  score: number;
}

export interface PendingRequest extends Friend {
  createdAt: string;
}

export interface SearchResult extends Friend {
  friendshipStatus: string;
  friendshipId: string | null;
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