import type { Friend } from "./friend";

export interface QuizShareModalProps {
  quizId: string;
  quizName: string;
  onClose: () => void;
  onShared?: () => void;
}

export interface FriendsResponse {
  data: Friend[];
}

export interface ShareQuizRequest {
  customQuizId: string;
  friendUserIds: string[];
  token: string;
}

export interface ShareQuizResponse {
  data: {
    totalShared: number;
  };
  error?: string;
}
