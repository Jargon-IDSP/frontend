export interface EditNameDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string | null;
  currentName: string;
}
