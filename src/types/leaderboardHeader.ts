export type LeaderboardType = "general" | "private" | "self";

export interface LeaderboardHeaderProps {
  activeTab: LeaderboardType;
  onTabChange: (tab: LeaderboardType) => void;
  showActions?: boolean;
}
