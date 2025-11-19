import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { BACKEND_URL } from '../lib/api';

export interface AvatarConfig {
  shape: number; // Index of selected body shape (0-8)
  hair: number | null; // Index of selected hairstyle (0-5, null for none)
  headwear: number | null; // Index of selected headwear
  uniform: number | null; // Index of selected uniform
  shoes: number | null; // Index of selected shoes
  eyewear: number | null; // Index of selected eyewear
  facialHair: number | null; // Index of selected facial hair
  makeup: number | null; // Index of selected makeup
}

export interface AvatarData {
  avatarConfig: {
    character: string;
    outfit: string;
    hatType: string | null;
    accessories: string[];
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    unlockedItems: string[];
    imageUrl?: string;
  };
}

export function useAvatar() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['avatar'],
    queryFn: async (): Promise<AvatarData> => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/profile/avatar`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch avatar');
      }

      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateMutation = useMutation({
    mutationFn: async (config: Partial<AvatarData['avatarConfig']>) => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/profile/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!res.ok) {
        throw new Error('Failed to update avatar');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avatar'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return {
    avatar: query.data,
    loading: query.isLoading,
    error: query.error,
    updateAvatar: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
