import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth, useClerk } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";
import type { ProfileData } from "../types/profile";

export function useProfile() {
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const queryClient = useQueryClient();

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
        // Handle unauthorized errors - session has expired
        if (res.status === 401) {
          // Clear all cached data
          queryClient.clear();
          // Sign out the user
          await signOut();
          // Redirect will happen automatically via Clerk
          throw new Error("Session expired. Please log in again.");
        }

        const errorData = await res.json();
        throw new Error(errorData.error || "Unable to fetch profile");
      }

      const data = await res.json();
      return data.user || data;
    },
    staleTime: 5 * 60 * 1000, 
    retry: 2,
  });
}
