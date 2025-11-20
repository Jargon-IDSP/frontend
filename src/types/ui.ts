import type { ReactNode, CSSProperties } from 'react';

export interface CardProps {
  onClick?: () => void;
  children: ReactNode;
  hoverable?: boolean;
  style?: CSSProperties;
}

export interface NavigationCardProps {
  title: string;
  description?: string;
  cardType?: 'industry' | 'generated' | 'friends';
  onClick: () => void;
  disabled?: boolean;
  buttonText?: string;
}
