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
  badges: BadgeIcon[];
}

export interface BlockedUserViewProps {
  displayName: string;
}
