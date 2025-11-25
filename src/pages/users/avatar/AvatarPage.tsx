import Avatar from "../../../components/avatar/Avatar";
import { AvatarCustomizer } from "../../../components/avatar/AvatarCustomizer";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAvatar } from '../../../hooks/useAvatar';
import LoadingBar from '../../../components/LoadingBar';
import { toDataAttributeId } from '../../../components/avatar/bodyViewBoxes';
import logoOrangeIcon from '../../../assets/logos/logo_orangeIcon.png';

export function AvatarEditPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const context = (searchParams.get('context') as 'onboarding' | 'profile') || 'profile';

  const handleBack = () => {
    if (context === 'profile') {
      navigate('/profile');
    } else {
      navigate('/onboarding/industry');
    }
  };

  const handleSave = () => {
    if (context === 'onboarding') {
      navigate('/');
    }
  };

  return (
    <div className="container">
      <div className="avatar-edit-page">
      <div className="avatar-customization__top">
        <button
          type="button"
          className="avatar-customization__back"
          onClick={handleBack}
          aria-label="Go back"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
        <h1>Your Avatar</h1>

        {context === 'onboarding' && (
          <div className="avatar-customization__progress">
            <div className="avatar-customization__progress-fill" />
          </div>
        )}
      </div>
        <AvatarCustomizer
          context={context}
          onBack={handleBack}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}

export function AvatarOnboardingPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/onboarding/industry');
  };

  const handleSave = () => {
    // After saving avatar, navigate to home to complete onboarding
    navigate('/');
  };

  return (
    <div className="container">
      <div className="avatar-edit-page">
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
              onClick={handleBack}
              aria-label="Go back"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
            <div className="avatar-customization__progress-wrapper">
              <div className="avatar-customization__progress">
                <div className="avatar-customization__progress-fill" style={{ width: '75%' }} />
              </div>
            </div>
          </div>
          <h1 className="avatar-customization__title">Create your own Rocky!</h1>
        </div>
        <AvatarCustomizer
          context="onboarding"
          onBack={handleBack}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}

export function AvatarViewPage () {
  const navigate = useNavigate();
  const { avatar, isLoading } = useAvatar();

  const defaultConfig = {
    body: 'body-1',
    bodyColor: '#ffba0a',
    expression: 'body-1-h1',
  };

  const config = avatar || defaultConfig;
  const shapeDataId = toDataAttributeId(config.body || 'body-1', 'body');
  const hairDataId = avatar?.hair ? toDataAttributeId(avatar.hair, 'hair') : undefined;

  return (
    <div className="container">
      <div className="avatar-view-page">
        <LoadingBar isLoading={isLoading} hasData={!!avatar} text="Loading avatar" />
        {!isLoading && (
          <div
            className="avatar-customization__canvas"
            data-shape={shapeDataId}
            data-hair={hairDataId}
          >
            <Avatar config={config} renderMode="layered" />
          </div>
        )}
        <button onClick={() => navigate('/avatar/edit')}>Edit Avatar</button>
      </div>
    </div>
  );
}