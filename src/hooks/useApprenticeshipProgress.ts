import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";

interface ApprenticeshipProgress {
  levelId: number;
  industryId: number | null;
  quizzesCompleted: number;
  isLevelComplete: boolean;
  completedAt: Date | null;
}

interface ProgressResponse {
  progress: ApprenticeshipProgress[];
}

export function useApprenticeshipProgress() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["apprenticeshipProgress"],
    queryFn: async (): Promise<ApprenticeshipProgress[]> => {
      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/prebuilt-quizzes/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch progress");
      }

      const data: ProgressResponse = await response.json();
      return data.progress || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}