export interface DeleteDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel?: () => void;
  documentId: string | null;
  documentName?: string;
  navigateOnSuccess?: boolean;
}
