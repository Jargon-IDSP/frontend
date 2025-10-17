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

export interface CustomQuestion {
  id: string;
  prompt: string;
  correctAnswer: {
    id: string;
    term: string;
    definition: string;
  };
  createdAt: string;
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
  documentId?: string;
  completed: boolean;
  score: number;
  createdAt: string;
  completedAt?: string;
  document?: {
    id: string;
    filename: string;
    fileUrl: string;
  };
  questions: CustomQuestion[];
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