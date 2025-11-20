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

  const paramsString = useMemo(
    () => JSON.stringify(params || {}),
    [params?.language, params?.industry_id]
  );

  const url = useMemo(() => {
    const queryString = params
      ? "?" + new URLSearchParams(params).toString()
      : "";
    if (endpoint.startsWith("documents/")) {
      return `${BACKEND_URL}/learning/${endpoint}${queryString}`;
    } else {
      return `${BACKEND_URL}/learning/${type}/${endpoint}${queryString}`;
    }
  }, [type, endpoint, params]);

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
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 2,
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    isError: query.isError,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
};
