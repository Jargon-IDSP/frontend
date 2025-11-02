import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../lib/api";
import type { QuizQuestion } from "../types/learning";

interface QuizResponse {
  quiz?: {
    questions: QuizQuestion[];
  };
  questions?: QuizQuestion[];
  data?: QuizQuestion[];
}

export function useCustomQuiz(
    quizId: string | null,
    quizNumber: number = 1,
    enabled: boolean = true
  ) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ["customQuiz", quizId, quizNumber],
    queryFn: async (): Promise<QuizQuestion[]> => {
      const token = await getToken();

      let url = "";
      if (quizId) {
        url = `${BACKEND_URL}/learning/attempts/${quizId}`;
      } else {
        url = `${BACKEND_URL}/learning/custom/quiz/generate?quiz_number=${quizNumber}`;
      }

      console.log("Fetching quiz from:", url);
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Quiz fetch failed:", response.status, errorText);
        throw new Error("Failed to fetch quiz");
      }

      const data: QuizResponse = await response.json();
      console.log("Quiz data received:", data);

      if (data.quiz?.questions) {
        return data.quiz.questions;
      } else if (data.questions) {
        return data.questions;
      } else if (data.data) {
        return data.data;
      } else {
        console.error("Unexpected data structure:", data);
        throw new Error("Invalid quiz data structure");
      }
    },
    enabled,
    retry: 2,
    staleTime: 10 * 60 * 1000,
  });
}
