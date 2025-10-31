import type { ReactNode, CSSProperties } from 'react';

export interface CardProps {
  onClick?: () => void;
  children: ReactNode;
  hoverable?: boolean;
  style?: CSSProperties;
}

export interface NavigationCardProps {
  icon: string;
  title: string;
  description?: string;
  onClick: () => void;
  disabled?: boolean;
}
