import logoOrangeIcon from '../../assets/logos/logo_orangeIcon.png';

interface OnboardingHeaderProps {
  title: string;
  onBack: () => void;
  progressPercentage?: number;
  showProgress?: boolean;
}

export default function OnboardingHeader({
  title,
  onBack,
  progressPercentage = 0,
  showProgress = false,
}: OnboardingHeaderProps) {
  return (
    <div className="avatar-customization__header">
      <img 
        src={logoOrangeIcon} 
        alt="Jargon Logo" 
        className="avatar-customization__logo"
      />
      <div className="avatar-customization__header-row">
        <button
          type="button"
          className="avatar-customization__back"
          onClick={onBack}
          aria-label="Go back"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
        {showProgress ? (
          <div className="avatar-customization__progress-wrapper">
            <div className="avatar-customization__progress">
              <div 
                className="avatar-customization__progress-fill" 
                style={{ width: `${Math.max(progressPercentage, 0)}%` }} 
              />
            </div>
          </div>
        ) : null}
      </div>
      <h1 className="avatar-customization__title">{title}</h1>
    </div>
  );
}

