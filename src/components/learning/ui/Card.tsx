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
export function NavigationCard({ title, description, onClick, disabled = false }: NavigationCardProps) {
  const cardClassName = disabled ? 'card disabled' : 'card clickable hoverable';

  return (
    <div onClick={disabled ? undefined : onClick} className={cardClassName}>
      <div className="navigation-card__content">
        <div className="navigation-card__text">
          <div className={`navigation-card__title ${!description ? 'navigation-card__title--no-description' : ''}`}>
         {title}
          </div>
          {description && (
            <div className="navigation-card__description">{description}</div>
          )}
        </div>
        <span className="navigation-card__arrow">{disabled ? '⏳' : '→'}</span>
      </div>
    </div>
  );
}
