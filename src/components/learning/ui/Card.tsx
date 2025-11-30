import type { CardProps, NavigationCardProps } from '../../../types/ui';
import enterFolder from '../../../assets/icons/enterFolder.svg';

const badgeModules = import.meta.glob<string>('../../../assets/badges/**/*.svg', {
  eager: true,
  import: 'default'
});

const industryBadgeMap: { [key: string]: string[] } = {
  electrician: ['electrician/E1.svg', 'electrician/E2.svg', 'electrician/E3.svg'],
  plumber: ['plumber/P1.svg', 'plumber/P2.svg', 'plumber/P3.svg'],
  carpenter: ['carpenter/C1.svg', 'carpenter/C2.svg', 'carpenter/C3.svg'],
  mechanic: ['mechanic/E1.svg', 'mechanic/E2.svg', 'mechanic/E3.svg'],
  welder: ['welder/W1.svg', 'welder/W2.svg', 'welder/W3.svg'],
  general: ['general/G1.svg', 'general/G2.svg', 'general/G3.svg'],
};

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

export function NavigationCard({ title, cardType = 'industry', onClick, disabled = false, buttonText, industryName }: NavigationCardProps) {
  const industryKey = industryName?.toLowerCase() || 'general';
  const badgePaths = industryBadgeMap[industryKey] || industryBadgeMap.general;

  const badges = badgePaths.map(path => {
    const fullPath = `../../../assets/badges/${path}`;
    return badgeModules[fullPath];
  }).filter(Boolean);

  return (
    <div
      className={`navCardWrapper ${cardType} ${disabled ? 'disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
      style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      <div className="tabColor">{title}</div>

      <div className="navCardContent folderColor">
        <div className="folderBadges">
          {disabled ? (
            <span>Coming Soon...</span>
          ) : (
            badges.map((badge, index) => (
              <div key={index} className="badgeBox">
                <img src={badge} alt={`Badge ${index + 1}`} />
              </div>
            ))
          )}
        </div>
        {buttonText && (
          <div className="folderButton">
            <span>{buttonText}</span>
            <img src={enterFolder} alt="Arrow" className="arrowIcon" />
          </div>
        )}
      </div>
    </div>
  );
}
