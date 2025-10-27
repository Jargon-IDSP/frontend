import { useMemo } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import type { ApiResponse } from "../types/learning";
import { BACKEND_URL } from "../lib/api";
import type { UseLearningOptions } from "@/types/useLearning";

export const useLearning = <T>({
  type,
  endpoint,
  params,
  enabled = true,
}: UseLearningOptions) => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  // Memoize params to prevent unnecessary re-renders
  const paramsString = useMemo(
    () => JSON.stringify(params || {}),
    [params?.language, params?.industry_id]
  );

  // Build the URL
  const url = useMemo(() => {
    const queryString = params
      ? "?" + new URLSearchParams(params).toString()
      : "";

    // Special handling for document routes - they go directly under /learning/documents
    // not /learning/custom/documents
    if (endpoint.startsWith("documents/")) {
      // Document routes: /learning/documents/:documentId/terms
      return `${BACKEND_URL}/learning/${endpoint}${queryString}`;
    } else {
      // Regular routes: /learning/existing/... or /learning/custom/...
      return `${BACKEND_URL}/learning/${type}/${endpoint}${queryString}`;
    }
  }, [type, endpoint, params]);

  // Use TanStack Query
  const query = useQuery({
    queryKey: ["learning", type, endpoint, paramsString],
    queryFn: async (): Promise<ApiResponse<T>> => {
      console.log("Fetching from:", url);

      const token = await getToken();
      console.log("Token exists:", !!token);

      if (!token) {
        throw new Error("No authentication token available. Please log in.");
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response not OK:", response.status, errorText);
        throw new Error(
          `Failed to fetch data: ${response.status} - ${errorText}`
        );
      }

      const result: ApiResponse<T> = await response.json();
      console.log("Fetch result:", result);
      return result;
    },
    enabled: enabled && isLoaded && isSignedIn,
    staleTime: 5 * 60 * 1000, // 5 minutes - adjust based on your needs
    retry: 2, // Retry failed requests twice
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    // Expose additional useful query states
    isError: query.isError,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
};
