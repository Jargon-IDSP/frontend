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

export function NavigationCard({ title, cardType = 'industry', onClick, disabled = false, buttonText }: NavigationCardProps) {
  return (
    <div className={`navCardWrapper ${cardType}`}>
      <div className="tabColor"></div>

      <div className="navCardContent folderColor">
        <div className="folderColor">
          <div className="folderBadges">
            Badges go here in the future
          </div>
        <button
        onClick={disabled ? undefined : onClick}
        className="NavCardButton"
        disabled={disabled}
      >
        {disabled ? 'Coming Soon...' : (buttonText || title)}
      </button>
        </div>
    </div>
    </div>
  );
}
