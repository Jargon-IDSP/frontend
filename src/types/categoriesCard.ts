import type { ReactNode } from "react";

export interface CategoriesCardProps {
  title: string;
  children: ReactNode;
  onBack?: () => void;
  rightIcon?: ReactNode;
  bottomImages?: string[];
}
