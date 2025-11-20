export type TabType = "leaderboard" | "friends";

interface HeaderImages {
  leaderShowImg: string;
  leaderNoShowImg: string;
  friendsShowImg: string;
  friendsNoShowImg: string;
}


export const getHeaderImage = (
  activeTab: TabType,
  hasNoPoints: boolean,
  hasNoFriends: boolean,
  images: HeaderImages
): string => {
  if (activeTab === "leaderboard") {
    return hasNoPoints ? images.leaderNoShowImg : images.leaderShowImg;
  }
  return hasNoFriends ? images.friendsNoShowImg : images.friendsShowImg;
};


export const getPreviewUsers = <T>(users: T[], startIndex: number = 3): T[] => {
  return users.slice(startIndex);
};


export const isCurrentUser = (userId: string, profileId?: string): boolean => {
  return userId === profileId;
};


export const shouldShowEmptyState = (
  hasNoPoints: boolean,
  hasNoFriends: boolean,
  activeTab: TabType
): boolean => {
  return activeTab === "leaderboard" ? hasNoPoints : hasNoFriends;
};


export const hasNoPoints = (score: number): boolean => {
  return score === 0;
};


export const hasNoFriends = (friendsCount: number): boolean => {
  return friendsCount === 0;
};
