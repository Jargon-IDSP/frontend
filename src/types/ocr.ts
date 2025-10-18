export interface OCRPage {
  pageNumber: number;
  text: string;
  confidence?: number;
}

export interface OCRResponse {
  success: boolean;
  fullText?: string;
  pages?: OCRPage[];
  entities?: any[];
  tables?: any[];
  error?: string;
}