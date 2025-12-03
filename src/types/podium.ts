import type { User } from "../hooks/useLeaderboard";

export interface PodiumProps {
  users: User[];
  currentUserId?: string;
  fromRoute?: string;
  onAvatarLoadingChange?: (userId: string, isLoading: boolean) => void;
}