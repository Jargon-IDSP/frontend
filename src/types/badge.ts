export interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  iconUrl: string | null;
  levelId: number | null;
  industryId: number | null;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
  badge: Badge;
}
