import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { fetchRandomQuestion, type NormalizedQuestion } from "../lib/api";

interface UseRandomQuestionOptions {
  enabled?: boolean;
  refetchOnMount?: boolean;
}

export function useRandomQuestion(options: UseRandomQuestionOptions = {}) {
  const { getToken } = useAuth();
  const { enabled = true, refetchOnMount = true } = options;

  return useQuery({
    queryKey: ["randomQuestion"],
    queryFn: async (): Promise<NormalizedQuestion & { __raw?: unknown }> => {
      const token = await getToken();
      return fetchRandomQuestion(token || undefined);
    },
    enabled,
    refetchOnMount,
    staleTime: 0, // Always consider stale - we want fresh random questions
    gcTime: 0, // Don't cache - each fetch should be independent
    retry: 2,
  });
}
