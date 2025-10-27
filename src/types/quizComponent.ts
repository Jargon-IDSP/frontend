import type { QuizQuestion } from "./learning";

export interface QuizComponentProps {
  questions: QuizQuestion[];
  quizNumber: number;
  onComplete: (score: number, totalQuestions: number) => Promise<void>;
  onBack: () => void;
  preferredLanguage: string;
}

export interface ChatRequest {
  prompt: string;
  token: string;
}
