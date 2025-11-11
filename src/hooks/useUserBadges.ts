import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";

interface Badge {
  id: string;
  code: string;
  name: string;
  description: string;
  iconUrl: string | null;
  levelId: number | null;
  industryId: number | null;
}

interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
  badge: Badge;
}

export function useUserBadges() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["userBadges"],
    queryFn: async (): Promise<UserBadge[]> => {
      const token = await getToken();

      const response = await fetch(`${BACKEND_URL}/prebuilt-quizzes/badges`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch badges");
      }

      const data = await response.json();
      return data.badges || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute - short stale time so new badges show up quickly
  });
}
