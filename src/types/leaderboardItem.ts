import type { User } from "../hooks/useLeaderboard";

export interface LeaderboardItemProps {
  user: User;
  rank: number;
  isCurrentUser: boolean;
  isClickable?: boolean;
  fromRoute?: string;
}
