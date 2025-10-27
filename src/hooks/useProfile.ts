import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";

export interface ProfileData {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  score?: number;
  // Add other profile fields here
  [key: string]: any;
}

export function useProfile() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<ProfileData> => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Unable to fetch profile");
      }

      return await res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
