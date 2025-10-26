import type { ReactNode, CSSProperties } from 'react';

interface CardProps {
  onClick?: () => void;
  children: ReactNode;
  hoverable?: boolean;
  style?: CSSProperties;
}

export default function Card({ onClick, children, hoverable = true, style = {} }: CardProps) {
  const baseStyle: CSSProperties = {
    padding: '1.5rem',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    backgroundColor: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    ...style,
  };

  const clickableStyle: CSSProperties = onClick
    ? {
        cursor: 'pointer',
        transition: 'all 0.2s',
      }
    : {};

  return (
    <div
      onClick={onClick}
      style={{ ...baseStyle, ...clickableStyle }}
      onMouseEnter={
        hoverable && onClick
          ? (e) => {
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          : undefined
      }
      onMouseLeave={
        hoverable && onClick
          ? (e) => {
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}

// Specialized card for navigation items
interface NavigationCardProps {
  icon: string;
  title: string;
  description?: string;
  onClick: () => void;
}

export function NavigationCard({ icon, title, description, onClick }: NavigationCardProps) {
  return (
    <Card onClick={onClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: description ? '0.25rem' : 0, fontSize: '1.1rem' }}>
            {icon} {title}
          </div>
          {description && (
            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>{description}</div>
          )}
        </div>
        <span style={{ fontSize: '1.5rem', color: '#6b7280' }}>→</span>
      </div>
    </Card>
  );
}