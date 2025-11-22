import type { QuizQuestion } from "../learning";

// Quiz component prop types
export interface QuizComponentProps {
  questions: QuizQuestion[];
  quizNumber?: number;
  onComplete: (score: number, totalQuestions: number) => void;
  onBack: () => void;
  preferredLanguage: string;
  quizType?: 'custom' | 'existing' | 'category';
}

export interface QuizShareModalProps {
  quizId: string;
  quizName: string;
  onClose: () => void;
  onShared?: () => void;
}

export interface QuizCompletionProps {
  score: number;
  totalQuestions: number;
  onRetry: () => void;
  onBack: () => void;
  quizNumber?: number;
  isBossQuiz?: boolean;
  passed?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

export interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentQuestion?: string;
  chatHistory: ChatMessage[];
  chatPrompt: string;
  onChatPromptChange: (value: string) => void;
  onSendChat: (e?: React.FormEvent) => void;
  isLoading: boolean;
}
