import { useUser, useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { BACKEND_URL } from "../lib/api";
import type {
  UserPreferencesResponse,
  UserPreferences,
} from "@/types/useUserPreferences";

export const useUserPreferences = () => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const query = useQuery({
    queryKey: ["userPreferences", user?.id],
    queryFn: async (): Promise<UserPreferences> => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available");
      }

      const res = await fetch(`${BACKEND_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user preferences");
      }

      const data: UserPreferencesResponse = await res.json();

      return {
        language: data.user?.language || "english",
        industryId: data.user?.industryId || null,
        userId: user.id,
      };
    },
    enabled: !!user?.id, // Only fetch when user is available
    staleTime: 10 * 60 * 1000, // 10 minutes - preferences don't change often
    retry: 2,
  });

  return {
    language: query.data?.language ?? "english",
    industryId: query.data?.industryId ?? null,
    userId: query.data?.userId ?? user?.id ?? "",
    loading: query.isLoading,
    error: query.error?.message ?? null,
    isError: query.isError,
    refetch: query.refetch,
  };
};

// import { useState, useEffect } from 'react';
// import { useUser, useAuth } from '@clerk/clerk-react';
// import { BACKEND_URL } from '../lib/api';

// export const useUserPreferences = () => {
//   const { user } = useUser();
//   const { getToken } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [preferences, setPreferences] = useState({
//     language: 'english',
//     industryId: null as number | null,
//     userId: user?.id || '',
//   });

//   useEffect(() => {
//     const fetchPreferences = async () => {
//       if (!user?.id) {
//         setLoading(false);
//         return;
//       }

//       try {
//         const token = await getToken();
//         const res = await fetch(`${BACKEND_URL}/profile`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (res.ok) {
//           const data = await res.json();
//           setPreferences({
//             language: data.user?.language || 'english',
//             industryId: data.user?.industryId || null,
//             userId: user.id,
//           });
//         }
//       } catch (err) {
//         console.error('Error fetching user preferences:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPreferences();
//   }, [user?.id, getToken]);

//   return { ...preferences, loading };
// };
