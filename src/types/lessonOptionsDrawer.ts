export interface LessonOptionsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizId: string | null;
  documentId: string | null;
  documentName: string;
}
