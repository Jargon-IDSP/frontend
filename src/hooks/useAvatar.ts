import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";
import type { AvatarConfig } from "../types/avatar";

interface AvatarResponse {
  avatarConfig: AvatarConfig & {
    unlockedItems?: string[];
  };
}

export function useAvatar() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["avatar"],
    queryFn: async (): Promise<AvatarConfig> => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/avatar/edit`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch avatar");
      }

      const data: AvatarResponse = await res.json();
      return data.avatarConfig;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const mutation = useMutation({
    mutationFn: async (avatarConfig: AvatarConfig) => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/avatar/edit`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(avatarConfig),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update avatar");
      }

      const result = await res.json();
      return result.avatarConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["avatar"] });
    },
  });

  return {
    avatar: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    updateAvatar: mutation.mutate,
    updateAvatarAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    updateError: mutation.error,
    refetch: query.refetch,
  };
}
