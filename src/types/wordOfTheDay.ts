export interface WordOfTheDayData {
  term: string;
  definition: string;
  termTranslated?: string;
  industry?: string;
  level?: string;
}

export interface CachedWordData {
  data: WordOfTheDayData;
  date: string; // YYYY-MM-DD format
}

export interface FlashcardResponse {
  data: {
    term: {
      english: string;
      [key: string]: string;
    };
    definition: {
      english: string;
    };
    industry?: {
      name: string;
    };
    level?: {
      name: string;
    };
  };
}

export interface WordOfTheDayProps {
  documentId?: string;
  backgroundImage?: string;
  backgroundColor?: string;
}
