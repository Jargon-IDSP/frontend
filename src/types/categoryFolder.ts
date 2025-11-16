import type { ReactNode } from "react";

export interface CategoryFolderProps {
  title: string;
  icon?: string;
  subtitle?: string;
  locked?: boolean;
  completed?: boolean;
  showDeleteButton?: boolean;
  onDelete?: () => void;
  children: ReactNode;
  defaultOpen?: boolean;
}
