import type { Document } from "./document";

export interface OCRModalProps {
  document: Document;
  onClose: () => void;
}

export interface Flashcard {
  id: string;
  termEnglish: string;
  definitionEnglish: string;
}

export interface FlashcardsResponse {
  flashcards: Flashcard[];
}
