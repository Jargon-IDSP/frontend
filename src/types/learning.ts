import type { Multilingual } from "./language";

export interface Level {
  id: number;
  name: string;
  available_terms?: number;
  industry_terms?: number;
  general_terms?: number;
  total_general_terms?: number;
}

export interface Term {
  id: string;
  term: string;
  definition: string;
  nativeTerm?: string;
  nativeDefinition?: string;
  industry?: string;
  industry_id?: number | null;
  level?: string;
  level_id?: number;
  language?: string;
}

export interface CustomFlashcard
  extends Multilingual<"term">,
    Multilingual<"definition"> {
  id: string;
  documentId: string | null;
  userId: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
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

export interface CustomQuestion extends Multilingual<"prompt"> {
  id: string;
  userId: string;
  customQuizId: string | null;
  correctTermId: string;
  category?: string;
  pointsWorth: number;
  createdAt: string;
  correctAnswer?: CustomFlashcard;
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
  difficulty?: number;
  tags?: string[];
  correctAnswerId: string;
  language?: string;
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

export interface CustomQuiz {
  id: string;
  userId: string;
  documentId: string | null;
  name: string;
  category: string | null;
  pointsPerQuestion: number;
  createdAt: string;
  updatedAt: string;
  questions?: CustomQuestion[];
  document?: {
    id: string;
    filename: string;
  };
  _count?: {
    questions: number;
    sharedWith: number;
  };
  sharedWith?: Array<{
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

export interface UserQuizAttempt {
  id: string;
  userId: string;
  customQuizId: string | null;
  levelId: number | null;
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

export interface SharedQuiz {
  id: string;
  documentId?: string | null;
  sharedAt: string;
  customQuiz: {
    id: string;
    name: string;
    category: string | null;
    createdAt: string;
    documentId?: string | null;
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

 export interface UseRandomFlashcardOptions {
    type: "custom" | "existing";
    documentId?: string;
    category?: string;
    levelId?: number;
    industryId?: number;
    enabled?: boolean;
  }

  export interface FlashcardDisplayProps {
    type: "custom" | "existing";
    isRandom?: boolean;
    documentId?: string;
    category?: string;
    levelId?: number;
    industryId?: number;
    showIndustry?: boolean;
    showLevel?: boolean;
  }

  export interface CategoryFolderProps {
    categoryId: number;
    categoryName: string;
    documentCount: number;
  }