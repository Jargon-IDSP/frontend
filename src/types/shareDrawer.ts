export interface ShareDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizId: string | null;
  quizVisibility?: string;
}

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  quizId: string;
  quizName: string;
}
