import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";

interface JobInfo {
  id: string;
  state: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  progress: number;
  failedReason?: string;
  attemptsMade: number;
  timestamp: number;
}

interface DocumentJobStatusResponse {
  ocr: JobInfo | null;
  translation: JobInfo | null;
  flashcards: JobInfo | null;
}

interface UseDocumentJobStatusOptions {
  documentId: string | null;
  pollingInterval?: number;
}

export function useDocumentJobStatus({
  documentId,
  pollingInterval = 1000,
}: UseDocumentJobStatusOptions) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["documentJobStatus", documentId],
    queryFn: async (): Promise<DocumentJobStatusResponse> => {
      if (!documentId) {
        throw new Error("No document ID");
      }

      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/documents/${documentId}/job-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch document job status");
      }

      return await res.json();
    },
    enabled: !!documentId,
    refetchInterval: (query) => {
      // Stop polling when all jobs are completed or failed
      const data = query.state.data;
      if (!data) return pollingInterval;
      
      const allCompleted = [data.ocr, data.translation, data.flashcards].every(
        job => !job || job.state === 'completed' || job.state === 'failed'
      );
      
      return allCompleted ? false : pollingInterval;
    },
    refetchIntervalInBackground: false,
    retry: false,
    staleTime: 0,
  });
}

