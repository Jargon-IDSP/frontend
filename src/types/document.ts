export interface Document {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number | null;
  createdAt: string;
  extractedText?: string;
  ocrProcessed?: boolean;
}

export interface DocumentsListProps {
  refresh?: number;
}
