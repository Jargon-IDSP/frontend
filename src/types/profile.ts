import type { AvatarConfig } from "./avatar";

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
  avatar?: AvatarConfig | null;
  linkedinUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  indeedUrl?: string;
  [key: string]: any;
}

export interface BadgeIcon {
  id: string;
  name: string;
  url: string;
}

export interface ProfileHeaderProps {
  from?: string;
}

export interface ProfileCardProps {
  displayName: string;
  industryName: string;
  followerCount: number;
  followingCount: number;
  lessonCount: number;
  avatar?: AvatarConfig | null;
  isOwnProfile: boolean;
  isFriend: boolean;
  isFollowing: boolean;
  onFriendshipAction: () => void;
  isSendRequestPending: boolean;
  isRemoveFriendPending: boolean;
}

export interface ProfileOverviewProps {
  badgeCount: number;
  medalCount: number;
  joinedDate: string;
}

export interface ConnectWithMeProps {
  LinkedInUrl?: string;
  FacebookUrl?: string;
  InstagramUrl?: string;
  IndeedUrl?: string;
}

export interface BlockedUserViewProps {
  displayName: string;
}
