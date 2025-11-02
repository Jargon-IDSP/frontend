import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";

interface CustomQuiz {
  id: string;
  name: string;
  category: string | null;
  createdAt: string;
  _count: {
    questions: number;
    sharedWith: number;
  };
  sharedWith: Array<{
    id: string;
    sharedAt: string;
    sharedWith: {
      id: string;
      username: string | null;
      firstName: string | null;
      lastName: string | null;
    };
  }>;
}

interface MyQuizzesResponse {
  data: CustomQuiz[];
}

export function useMyQuizzes() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["myQuizzes"],
    queryFn: async (): Promise<CustomQuiz[]> => {
      const token = await getToken();
      const res = await fetch(
        `${BACKEND_URL}/learning/sharing/my-shared-quizzes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch quizzes");
      }

      const data: MyQuizzesResponse = await res.json();
      return data.data || [];
    },
    staleTime: 30 * 1000,
    retry: 2,
  });
}

export type { CustomQuiz };
