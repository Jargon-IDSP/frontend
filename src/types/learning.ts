import type { Multilingual } from "./language";
import type { Document, QuizCategory } from "./document";

export interface Term {
  id: string;
  term: {
    english: string;
    [key: string]: string;
  };
  definition: {
    english: string;
    [key: string]: string;
  };
  industry?: string;
  level?: string;
  industry_id?: number;
  level_id?: number;
}


export interface Question {
  id: string;
  prompt: string;
  difficulty: number;
  tags: string[];
  points: number;
  correctAnswer: {
    id: string;
    term: string;
    definition: string;
  };
}

export interface QuizQuestion {
  questionId: string;
  prompt: string;
  prompts?: {
    english: string;
    french: string;
    chinese: string;
    spanish: string;
    tagalog: string;
    punjabi: string;
    korean: string;
  };
  choices: {
    id: string;
    term: string;
    isCorrect: boolean;
    termId: string;
  }[];
  difficulty: number;
  tags: string[];
  correctAnswerId: string;
}

export interface CustomQuestion extends Multilingual<'prompt'> {
  id: string;
  userId: string;
  customQuizId: string | null;
  correctTermId: string;
  pointsWorth: number;
  createdAt: string;
  correctAnswer?: CustomFlashcard;
}


export interface CustomQuiz {
  id: string;
  userId: string;
  documentId: string | null;
  name: string;
  category: QuizCategory | null;
  pointsPerQuestion: number;
  createdAt: string;
  updatedAt: string;
  questions?: CustomQuestion[];
  document?: Document;
}


export interface UserQuizAttempt {
  id: string;
  userId: string;
  customQuizId: string;
  questionsAnswered: number;
  questionsCorrect: number;
  totalQuestions: number;
  percentComplete: number;
  percentCorrect: number;
  pointsEarned: number;
  maxPossiblePoints: number;
  completed: boolean;
  startedAt: string;
  completedAt: string | null;
  customQuiz?: CustomQuiz;
  answers?: UserQuizAnswer[];
}

export interface UserQuizAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  answerId: string;
  isCorrect: boolean;
  pointsEarned: number;
  answeredAt: string;
  question?: CustomQuestion;
  answer?: CustomFlashcard;
}

export interface Quiz {
  id: string;
  userId: string;
  levelId: number;
  completed: boolean;
  score: number;
  createdAt: string;
  completedAt?: string;
  level: {
    id: number;
    name: string;
  };
  questions: Question[];
}

export interface Level {
  id: number;
  name: string;
  available_terms?: number;
  industry_terms?: number;
  general_terms?: number;
  total_general_terms?: number;
}


export interface ApiResponse<T> {
  success: boolean;
  count: number;
  data: T;
  filters?: {
    language?: string;
    industry_id?: string;
    level_id?: string;
  };
  level_id?: string;
  document_id?: string;
  industryCount?: number;
  generalCount?: number;
}

export interface CustomFlashcard extends Multilingual<'term'>, Multilingual<'definition'> {
  id: string;
  documentId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SharedQuiz {
  id: string;
  sharedAt: string;
  customQuiz: {
    id: string;
    name: string;
    category: string | null;
    createdAt: string;
    user: {
      id: string;
      username: string | null;
      firstName: string | null;
      lastName: string | null;
    };
    _count: {
      questions: number;
    };
  };
}

export interface Friend {
  friendshipId: string;
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  score: number;
}

export interface QuizShareModalProps {
  quizId: string;
  quizName: string;
  onClose: () => void;
  onShared?: () => void;
}


export interface PendingRequest {
  friendshipId: string;
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  score: number;
  createdAt: string;
}

export interface SearchResult {
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  score: number;
  friendshipStatus: string;
  friendshipId: string | null;
}