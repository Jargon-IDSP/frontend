// Component prop types for document-related components

export interface ProcessingDocumentCardProps {
  filename: string;
  status: {
    hasTranslation: boolean;
    hasFlashcards: boolean;
    hasQuiz: boolean;
    flashcardCount: number;
    questionCount: number;
    quickTranslation?: boolean;
  };
  documentId?: string;
}
