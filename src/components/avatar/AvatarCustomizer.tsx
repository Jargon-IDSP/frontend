import { useState, useEffect, useMemo } from 'react';
import { avatarOptions } from './Avatar';
import { AvatarDisplay } from './AvatarDisplay';
import { AvatarSprite } from './AvatarSprite';
import { getBodyViewBox } from './bodyViewBoxes';
import type { AvatarConfig, AvatarCustomizerProps, Tab, TabId } from '../../types/avatar';
import { useAvatar } from '../../hooks/useAvatar';
import { useUser } from '@clerk/clerk-react';
import LoadingBar from '../LoadingBar';

// This is how the tabs are defined in the frontend
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

export function AvatarCustomizer({ context = 'profile', onSave: onSaveCallback }: AvatarCustomizerProps = {}) {
  const { user } = useUser();
  const { avatar, isLoading, updateAvatar, isUpdating } = useAvatar();

  const [activeTab, setActiveTab] = useState<TabId>('body');
  const [config, setConfig] = useState<AvatarConfig>({
    body: 'body-1',
    bodyColor: '#ffba0a',
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

  useEffect(() => {
    if (config.headwear && config.hair && config.hair !== 'hair-1' && config.hair !== 'hair-7') {
      updateConfig('hair', 'hair-1');
    }
  }, [config.headwear, config.hair]);

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

        if (onSaveCallback) {
          onSaveCallback(config);
        }
      },
    });
  };

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
        const hairOptions = config.headwear
          ? avatarOptions.hair.filter(id => id === 'hair-1' || id === 'hair-7')
          : avatarOptions.hair;

        return [
          { id: 'none', label: 'None' },
          ...hairOptions.map(id => ({ id, label: id }))
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
  }, [activeTab, selectedBody, config.headwear]);

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

  const renderOptionPreview = (optionId: string, category?: 'eyewear' | 'facial') => {
    if (optionId === 'none') {
      return <span className="avatar-option__label">None</span>;
    }

    if (activeTab === 'color') {
      return null;
    }

    let className = "avatar-option__preview";

    let viewBox = "0 0 300 300";

    switch (activeTab) {
      case 'body':
      case 'expression':
        className = "avatar-option__preview avatar-option__preview--body";
        viewBox = getBodyViewBox(optionId);
        break;

      case 'hair':
        className = "avatar-option__preview avatar-option__preview--hair";
        break;

      case 'headwear':
        className = "avatar-option__preview avatar-option__preview--headwear";
        break;

      case 'features':
        if (category === 'eyewear') {
          className = "avatar-option__preview avatar-option__preview--eyewear";
        } else if (category === 'facial') {
          className = "avatar-option__preview avatar-option__preview--facial";
        }
        break;

      case 'clothing':
        className = "avatar-option__preview avatar-option__preview--clothing";
        break;

      case 'shoes':
        className = "avatar-option__preview avatar-option__preview--shoes";
        break;
    }

    return (
      <AvatarSprite
        spriteId={optionId}
        className={className}
        viewBox={viewBox}
      />
    );
  };

  return (
    <div className="avatar-customization">
      <LoadingBar isLoading={isLoading} hasData={!!avatar} text="Loading avatar" />

      <div className="avatar-customization__preview">
        {!isLoading && <AvatarDisplay config={config} size={210} />}
      </div>

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

      <div className="avatar-customization__options-grid">
        {currentOptions.map(option => {
          const category = ('category' in option ? option.category : undefined) as 'eyewear' | 'facial' | undefined;
          const selected = isSelected(option.id, category);

          return (
            <button
              key={option.id}
              type="button"
              className={`avatar-option ${selected ? 'avatar-option--selected' : ''}`}
              onClick={() => handleOptionSelect(option.id, category)}
              aria-label={`Select ${option.label}`}
              style={
                activeTab === 'color' && option.id !== 'none'
                  ? { backgroundColor: option.id }
                  : undefined
              }
            >
              {renderOptionPreview(option.id, category)}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="avatar-customization__next"
        onClick={handleSave}
        disabled={isUpdating}
      >
        {isUpdating
          ? 'Saving...'
          : saveSuccess
          ? 'Saved!'
          : context === 'onboarding'
          ? 'Next'
          : 'Save'}
      </button>
    </div>
  );
}

export default AvatarCustomizer;
