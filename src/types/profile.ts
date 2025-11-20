export interface ProfileData {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  score?: number;
  language?: string;
  industryId?: number | null;
  introductionViewed?: boolean;
  onboardingCompleted?: boolean;
  [key: string]: any;
}

export interface BadgeIcon {
  id: string;
  name: string;
  url: string;
}

export interface ProfileHeaderProps {
  from?: string;
  isOwnProfile: boolean;
  isFriend: boolean;
  isFollowing: boolean;
  onFriendshipAction: () => void;
  isSendRequestPending: boolean;
  isRemoveFriendPending: boolean;
}

export interface ProfileCardProps {
  displayName: string;
  industryName: string;
  followerCount: number;
  followingCount: number;
  lessonCount: number;
}

export interface ProfileOverviewProps {
  badgeCount: number;
  joinedDate: string;
}

export interface BlockedUserViewProps {
  displayName: string;
}
