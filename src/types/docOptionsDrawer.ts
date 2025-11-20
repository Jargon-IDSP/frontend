export interface DocOptionsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string | null;
  documentName: string;
  quizId: string | null;
}