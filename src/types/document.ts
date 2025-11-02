import type { Language, LanguageOption, Multilingual, MultilingualText } from './language';
export type { Language, LanguageOption, MultilingualText };
export { SupportedLanguages } from './language';

export interface Document {
  id: string;
  filename: string;
  fileKey: string;
  fileUrl: string;
  fileType: string;
  fileSize: number | null;
  extractedText: string | null;
  ocrProcessed: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  status?: 'processing' | 'completed' | 'error';
  flashcardCount?: number;
  questionCount?: number;
}

export interface DocumentStatus {
  status: 'processing' | 'completed' | 'error';
  hasTranslation: boolean;
  hasFlashcards: boolean;
  hasQuiz: boolean;
  flashcardCount: number;
  questionCount: number;
  category: QuizCategory | null;
}

export interface Translation extends Multilingual<'text'> {
  id: string;
  documentId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  document: Document & {
    customQuizzes?: Array<{
      id: string;
      name: string;
      category: QuizCategory | null;
      questions: Array<{ id: string }>;
    }>;
  };
}

export type QuizCategory = 
  | 'SAFETY'
  | 'TECHNICAL'
  | 'TRAINING'
  | 'WORKPLACE'
  | 'PROFESSIONAL'
  | 'GENERAL';

export interface DocumentsListProps {
  refresh: number;
}

export interface UploadResponse {
  document: Document;
  redirectUrl: string;
}

export interface StatusResponse {
  status: DocumentStatus;
}

export interface TranslationResponse {
  translation: Translation;
}

export interface Category {
  id: number;
  name: string;
  documentCount: number;
}

export interface CategoriesResponse {
  data: {
    categories: Category[];
  };
  meta: {
    count: number;
  };
}
