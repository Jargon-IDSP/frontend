export interface ShareDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizId: string | null;
  quizVisibility?: string;
}
