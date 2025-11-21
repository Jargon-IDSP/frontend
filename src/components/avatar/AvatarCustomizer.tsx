import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Avatar, avatarOptions } from './Avatar';
import type { AvatarConfig } from '../../types/avatar';
import { useAvatar } from '../../hooks/useAvatar';
import { useUser } from '@clerk/clerk-react';

type TabId = 'body' | 'expression' | 'hair' | 'headwear' | 'features' | 'clothing' | 'shoes' | 'color';

interface Tab {
  id: TabId;
  label: string;
}

const tabs: Tab[] = [
  { id: 'body', label: 'Body' },
  { id: 'expression', label: 'Expression' },
  { id: 'hair', label: 'Hair' },
  { id: 'headwear', label: 'Headwear' },
  { id: 'features', label: 'Features' },
  { id: 'clothing', label: 'Clothing' },
  { id: 'shoes', label: 'Shoes' },
  { id: 'color', label: 'Color' },
];

export function AvatarCustomizer() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { avatar, isLoading, updateAvatar, isUpdating } = useAvatar();

  // Determine context from URL params
  const searchParams = new URLSearchParams(location.search);
  const context = (searchParams.get('context') as 'onboarding' | 'profile') || 'profile';

  const [activeTab, setActiveTab] = useState<TabId>('body');
  const [config, setConfig] = useState<AvatarConfig>({
    body: 'body-1',
    bodyColor: '#FFB6C1',
    expression: 'body-1-h1',
  });
  const [selectedBody, setSelectedBody] = useState('body-1');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (avatar) {
      setConfig(avatar);
      setSelectedBody(avatar.body || 'body-1');
    }
  }, [avatar]);

  const updateConfig = (key: keyof AvatarConfig, value: string | undefined) => {
    setConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleBodyChange = (body: string) => {
    setSelectedBody(body);
    setConfig(prev => ({
      ...prev,
      body,
      expression: undefined,
    }));
  };

  const handleSave = () => {
    updateAvatar(config, {
      onSuccess: () => {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);

        if (context === 'onboarding') {
          // Navigate to next onboarding step
          navigate('/');
        }
      },
    });
  };

  const handleBack = () => {
    if (context === 'profile') {
      navigate('/profile');
    } else {
      navigate('/onboarding/industry');
    }
  };

  // Get options for current tab
  const currentOptions = useMemo(() => {
    switch (activeTab) {
      case 'body':
        return avatarOptions.bodies.map(id => ({ id, label: id }));
      case 'expression':
        const expressions = avatarOptions.expressions[selectedBody as keyof typeof avatarOptions.expressions] || [];
        return [
          { id: selectedBody, label: 'Neutral' },
          ...expressions.map(id => ({ id, label: id.split('-').pop() || id }))
        ];
      case 'hair':
        return [
          { id: 'none', label: 'None' },
          ...avatarOptions.hair.map(id => ({ id, label: id }))
        ];
      case 'headwear':
        return [
          { id: 'none', label: 'None' },
          ...avatarOptions.headwear.map(id => ({ id, label: id }))
        ];
      case 'features':
        return [
          { id: 'none', label: 'None' },
          ...avatarOptions.eyewear.map(id => ({ id, label: id, category: 'eyewear' as const })),
          ...avatarOptions.facial.map(id => ({ id, label: id, category: 'facial' as const }))
        ];
      case 'clothing':
        return [
          { id: 'none', label: 'None' },
          ...avatarOptions.clothing.map(id => ({ id, label: id }))
        ];
      case 'shoes':
        return [
          { id: 'none', label: 'None' },
          ...avatarOptions.shoes.map(id => ({ id, label: id }))
        ];
      case 'color':
        return avatarOptions.bodyColors.map(color => ({ id: color, label: color }));
      default:
        return [];
    }
  }, [activeTab, selectedBody]);

  const handleOptionSelect = (optionId: string, category?: 'eyewear' | 'facial') => {
    if (activeTab === 'body') {
      handleBodyChange(optionId);
    } else if (activeTab === 'expression') {
      updateConfig('expression', optionId);
    } else if (activeTab === 'color') {
      updateConfig('bodyColor', optionId);
    } else if (activeTab === 'features') {
      if (optionId === 'none') {
        updateConfig('eyewear', undefined);
        updateConfig('facial', undefined);
      } else if (category) {
        updateConfig(category, optionId);
      }
    } else {
      const key = activeTab as keyof AvatarConfig;
      updateConfig(key, optionId === 'none' ? undefined : optionId);
    }
  };

  const isSelected = (optionId: string, category?: 'eyewear' | 'facial') => {
    if (activeTab === 'body') {
      return selectedBody === optionId;
    } else if (activeTab === 'expression') {
      return config.expression === optionId;
    } else if (activeTab === 'color') {
      return config.bodyColor === optionId;
    } else if (activeTab === 'features') {
      if (optionId === 'none') {
        return !config.eyewear && !config.facial;
      } else if (category === 'eyewear') {
        return config.eyewear === optionId;
      } else if (category === 'facial') {
        return config.facial === optionId;
      }
      return false;
    } else {
      const key = activeTab as keyof AvatarConfig;
      if (optionId === 'none') {
        return !config[key];
      }
      return config[key] === optionId;
    }
  };

  if (isLoading) {
    return (
      <div className="avatar-customization">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="avatar-customization">
      {/* Header with back button and progress */}
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
        {context === 'onboarding' && (
          <div className="avatar-customization__progress">
            <div className="avatar-customization__progress-fill" />
          </div>
        )}
      </div>

      <h1>Create your Rocky!</h1>

      {/* Avatar Preview */}
      <div className="avatar-customization__preview">
        <div className="avatar-customization__canvas">
          <Avatar config={config} size={250} />
        </div>
      </div>

      {/* Username Display */}
      <label className="avatar-customization__input-label" htmlFor="avatarName">
        User Name
      </label>
      <input
        id="avatarName"
        type="text"
        className="avatar-customization__input"
        value={user?.username || user?.firstName || 'User'}
        disabled
        readOnly
      />

      {/* Tabs */}
      <div className="avatar-customization__tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            className={`avatar-customization__tab ${
              tab.id === activeTab ? 'avatar-customization__tab--active' : ''
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Options Grid */}
      <div className="avatar-customization__options-grid">
        {currentOptions.map(option => {
          const category = 'category' in option ? (option.category as 'eyewear' | 'facial') : undefined;
          const selected = isSelected(option.id, category);

          return (
            <button
              key={option.id}
              type="button"
              className={`avatar-option ${selected ? 'avatar-option--selected' : ''}`}
              onClick={() => handleOptionSelect(option.id, category as 'eyewear' | 'facial' | undefined)}
              style={
                activeTab === 'color' && option.id !== 'none'
                  ? { backgroundColor: option.id }
                  : undefined
              }
            >
              {activeTab === 'color' && option.id !== 'none' ? (
                <span className="avatar-option__color-swatch" />
              ) : (
                <span className="avatar-option__label">{option.label}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Save/Next Button */}
      <button
        type="button"
        className="avatar-customization__next"
        onClick={handleSave}
        disabled={isUpdating}
      >
        {isUpdating
          ? 'Saving...'
          : saveSuccess
          ? '✓ Saved!'
          : context === 'onboarding'
          ? 'Next'
          : 'Save'}
      </button>
    </div>
  );
}

export default AvatarCustomizer;
