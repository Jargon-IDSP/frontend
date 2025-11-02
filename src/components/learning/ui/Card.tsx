import type { CardProps, NavigationCardProps } from '../../../types/ui';

export default function Card({ onClick, children, hoverable = true, style = {} }: CardProps) {
  const className = [
    'card',
    onClick ? 'clickable' : '',
    hoverable ? 'hoverable' : ''
  ].filter(Boolean).join(' ');

  return (
    <div
      onClick={onClick}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}

// Specialized card for navigation items
export function NavigationCard({ title, description, onClick, disabled = false, buttonText }: NavigationCardProps) {

  return (
    <div className="navCardWrapper">
      <div className="navCardContent">
        {description && (
          <div className="NavCardDescription">{description}</div>
        )}
      </div>
      <button
        onClick={disabled ? undefined : onClick}
        className="NavCardButton"
        disabled={disabled}
      >
        {disabled ? 'Coming Soon...' : (buttonText || title)}
      </button>
    </div>
  );
}
