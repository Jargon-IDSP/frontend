import type { ReactNode, CSSProperties } from 'react';

interface ButtonProps {
  onClick: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  style?: CSSProperties;
}

export default function Button({
  onClick,
  children,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  size = 'medium',
  className = '',
  style,
}: ButtonProps) {
  const classes = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    fullWidth ? 'button--full-width' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={classes}
      style={style}
    >
      {children}
    </button>
  );
}