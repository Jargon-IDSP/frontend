import type { Document } from './document';

export interface DocumentSelectorProps {
  onDocumentSelect: (document: Document) => void;
  filterProcessed?: boolean;
  emptyStateMessage?: string;
}
