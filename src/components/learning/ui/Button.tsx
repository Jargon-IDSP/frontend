import type { ReactNode, CSSProperties } from 'react';

interface ButtonProps {
  onClick: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: CSSProperties;
}

const variants = {
  primary: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
  },
  secondary: {
    backgroundColor: '#f3f4f6',
    color: '#1f2937',
    border: '1px solid #e5e7eb',
  },
  danger: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
  },
  success: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
  },
};

const sizes = {
  small: { padding: '0.5rem 0.75rem', fontSize: '0.875rem' },
  medium: { padding: '0.75rem 1rem', fontSize: '1rem' },
  large: { padding: '1rem 1.5rem', fontSize: '1.1rem' },
};

export default function Button({
  onClick,
  children,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  size = 'medium',
  style = {},
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        ...sizes[size],
        borderRadius: '6px',
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        width: fullWidth ? '100%' : 'auto',
        transition: 'all 0.2s',
        ...style,
      }}
    >
      {children}
    </button>
  );
}