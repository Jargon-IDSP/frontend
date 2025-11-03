import type { User } from "../hooks/useLeaderboard";

export interface PodiumProps {
  users: User[];
  currentUserId?: string;
}