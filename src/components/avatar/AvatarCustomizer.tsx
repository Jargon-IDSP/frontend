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
  { id: 'accessories', label: 'Make up' },
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

  // Remove beards when h1 expression is selected
  useEffect(() => {
    if (config.expression && config.expression.includes('-h1') && config.facial) {
      updateConfig('facial', undefined);
    }
  }, [config.expression, config.facial]);

  // Remove h1 expression when beard is selected
  useEffect(() => {
    if (config.facial && config.expression && config.expression.includes('-h1')) {
      const baseBody = config.expression.split('-').slice(0, 2).join('-'); // e.g., "body-1-h1" -> "body-1"
      updateConfig('expression', baseBody);
    }
  }, [config.facial]);

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
        return [
          // Shape section
          { id: '__subtitle__', label: 'Shape', isSubtitle: true },
          ...avatarOptions.bodies.map(id => ({ id, label: id })),
          // Color section
          { id: '__subtitle__color__', label: 'Color', isSubtitle: true },
          ...avatarOptions.bodyColors.map(color => ({ id: color, label: color }))
        ];
      case 'expression':
        const expressions = avatarOptions.expressions[selectedBody as keyof typeof avatarOptions.expressions] || [];
        const filteredExpressions = config.facial
          ? expressions.filter(id => !id.includes('-h1'))
          : expressions;
        return [
          { id: selectedBody, label: 'Neutral' },
          ...filteredExpressions.map(id => ({ id, label: id.split('-').pop() || id }))
        ];
      case 'hair':
        const hairOptions = config.headwear
          ? avatarOptions.hair.filter(id => id === 'hair-1' || id === 'hair-7')
          : avatarOptions.hair;
        const facialOptions = (config.expression && config.expression.includes('-h1'))
          ? avatarOptions.facial.filter(id => !id.startsWith('beard-'))
          : avatarOptions.facial;

        return [
          // Hair section
          { id: '__subtitle__hair__', label: 'Hair', isSubtitle: true },
          { id: 'none-hair', label: 'None' },
          ...hairOptions.map(id => ({ id, label: id })),
          // Facial Hair section
          { id: '__subtitle__facial__', label: 'Facial Hair', isSubtitle: true },
          { id: 'none-facial', label: 'None', category: 'facial' as const },
          ...facialOptions.map(id => ({ id, label: id, category: 'facial' as const }))
        ];
      case 'accessories':
        // Filter out masks from eyewear since they're now in headwear
        const eyewearOptions = avatarOptions.eyewear.filter(id => id !== 'orange-mask' && id !== 'orange-mask-2');
        
        return [
          // Eyewear section
          { id: '__subtitle__eyewear__', label: 'Eyewear', isSubtitle: true },
          { id: 'none-eyewear', label: 'None', category: 'eyewear' as const },
          ...eyewearOptions.map(id => ({ id, label: id, category: 'eyewear' as const })),
          // Headwear section
          { id: '__subtitle__headwear__', label: 'Headwear', isSubtitle: true },
          { id: 'none-headwear', label: 'None', category: 'headwear' as const },
          ...avatarOptions.headwear.map(id => ({ id, label: id, category: 'headwear' as const })),
          // Clothing section
          { id: '__subtitle__clothing__', label: 'Clothing', isSubtitle: true },
          { id: 'none-clothing', label: 'None', category: 'clothing' as const },
          ...avatarOptions.clothing.map(id => ({ id, label: id, category: 'clothing' as const })),
          // Shoes section
          { id: '__subtitle__shoes__', label: 'Shoes', isSubtitle: true },
          { id: 'none-shoes', label: 'None', category: 'shoes' as const },
          ...avatarOptions.shoes.map(id => ({ id, label: id, category: 'shoes' as const })),
          // Accessories section
          { id: '__subtitle__accessories__', label: 'Make up', isSubtitle: true },
          { id: 'none-accessories', label: 'None', category: 'accessories' as const },
          ...avatarOptions.accessories.map(id => ({ id, label: id, category: 'accessories' as const }))
        ];
      default:
        return [];
    }
  }, [activeTab, selectedBody, config.headwear, config.facial, config.expression]);

  const handleOptionSelect = (optionId: string, category?: 'eyewear' | 'facial' | 'headwear' | 'clothing' | 'shoes' | 'accessories') => {
    // Ignore subtitle clicks
    if (optionId.startsWith('__subtitle__')) {
      return;
    }

    // Handle "none" options with category-specific IDs
    if (optionId.startsWith('none-')) {
      const noneCategory = optionId.split('-')[1] as 'hair' | 'facial' | 'eyewear' | 'headwear' | 'clothing' | 'shoes' | 'accessories';
      if (activeTab === 'hair') {
        if (noneCategory === 'facial') {
          updateConfig('facial', undefined);
        } else {
          updateConfig('hair', undefined);
        }
      } else if (activeTab === 'accessories') {
        if (noneCategory === 'eyewear') {
          updateConfig('eyewear', undefined);
        } else if (noneCategory === 'headwear') {
          // Clear both headwear and eyewear if it's a mask
          if (config.eyewear === 'orange-mask' || config.eyewear === 'orange-mask-2') {
            updateConfig('eyewear', undefined);
          }
          updateConfig('headwear', undefined);
        } else if (noneCategory === 'clothing') {
          updateConfig('clothing', undefined);
        } else if (noneCategory === 'shoes') {
          updateConfig('shoes', undefined);
        } else if (noneCategory === 'accessories') {
          updateConfig('accessories', undefined);
        }
      }
      return;
    }

    if (activeTab === 'body') {
      // Check if it's a color (hex color) or body shape
      if (optionId.startsWith('#')) {
        updateConfig('bodyColor', optionId);
      } else {
        handleBodyChange(optionId);
      }
    } else if (activeTab === 'expression') {
      updateConfig('expression', optionId);
    } else if (activeTab === 'hair') {
      if (category === 'facial') {
        updateConfig('facial', optionId);
      } else {
        updateConfig('hair', optionId);
      }
    } else if (activeTab === 'accessories') {
      if (category === 'eyewear') {
        updateConfig('eyewear', optionId);
      } else if (category === 'headwear') {
        if (optionId === 'orange-mask' || optionId === 'orange-mask-2') {
          // Masks are stored as eyewear, not headwear
          updateConfig('eyewear', optionId);
          updateConfig('headwear', undefined);
        } else {
          // Regular headwear
          updateConfig('headwear', optionId);
          // Clear eyewear if it's a mask
          if (config.eyewear === 'orange-mask' || config.eyewear === 'orange-mask-2') {
            updateConfig('eyewear', undefined);
          }
        }
      } else if (category === 'clothing') {
        updateConfig('clothing', optionId);
      } else if (category === 'shoes') {
        updateConfig('shoes', optionId);
      } else if (category === 'accessories') {
        updateConfig('accessories', optionId);
      }
    } else {
      const key = activeTab as keyof AvatarConfig;
      updateConfig(key, optionId === 'none' ? undefined : optionId);
    }
  };

  const isSelected = (optionId: string, category?: 'eyewear' | 'facial' | 'headwear' | 'clothing' | 'shoes' | 'accessories') => {
    if (activeTab === 'body') {
      if (optionId.startsWith('#')) {
        return config.bodyColor === optionId;
      } else {
        return selectedBody === optionId;
      }
    } else if (activeTab === 'expression') {
      return config.expression === optionId;
      } else if (activeTab === 'accessories') {
        if (optionId.startsWith('none-')) {
          const noneCategory = optionId.split('-')[1];
          if (noneCategory === 'eyewear') {
            return !config.eyewear;
          } else if (noneCategory === 'headwear') {
            return !config.headwear && !(config.eyewear === 'orange-mask' || config.eyewear === 'orange-mask-2');
          } else if (noneCategory === 'clothing') {
            return !config.clothing;
          } else if (noneCategory === 'shoes') {
            return !config.shoes;
          } else if (noneCategory === 'accessories') {
            return !config.accessories;
          }
          return false;
        } else if (category === 'eyewear') {
          return config.eyewear === optionId;
        } else if (category === 'headwear') {
          if (optionId === 'orange-mask' || optionId === 'orange-mask-2') {
            return config.eyewear === optionId;
          } else {
            return config.headwear === optionId;
          }
        } else if (category === 'clothing') {
          return config.clothing === optionId;
        } else if (category === 'shoes') {
          return config.shoes === optionId;
        } else if (category === 'accessories') {
          return config.accessories === optionId;
        }
        return false;
    } else if (activeTab === 'hair') {
      if (optionId.startsWith('none-')) {
        const noneCategory = optionId.split('-')[1];
        if (noneCategory === 'facial') {
          return !config.facial;
        } else {
          return !config.hair;
        }
      } else if (category === 'facial') {
        return config.facial === optionId;
      } else {
        return config.hair === optionId;
      }
    } else {
      const key = activeTab as keyof AvatarConfig;
      if (optionId === 'none') {
        return !config[key];
      }
      return config[key] === optionId;
    }
  };

  const renderOptionPreview = (optionId: string, category?: 'eyewear' | 'facial' | 'headwear' | 'clothing' | 'shoes' | 'accessories') => {
    if (optionId === 'none' || optionId.startsWith('none-')) {
      return <span className="avatar-option__label">None</span>;
    }

    // Colors don't need preview
    if (optionId.startsWith('#')) {
      return null;
    }

    let className = "avatar-option__preview";
    let viewBox = "0 0 300 300";

    if (activeTab === 'body') {
      // Body shapes
      if (!optionId.startsWith('#')) {
        className = "avatar-option__preview avatar-option__preview--body";
        viewBox = getBodyViewBox(optionId);
      }
    } else if (activeTab === 'expression') {
      className = "avatar-option__preview avatar-option__preview--body";
      viewBox = getBodyViewBox(optionId);
    } else if (activeTab === 'hair') {
      className = "avatar-option__preview avatar-option__preview--hair";
    } else if (activeTab === 'accessories') {
      if (category === 'eyewear') {
        className = "avatar-option__preview avatar-option__preview--eyewear";
      } else if (category === 'headwear') {
        className = "avatar-option__preview avatar-option__preview--headwear";
      } else if (category === 'clothing') {
        className = "avatar-option__preview avatar-option__preview--clothing";
      } else if (category === 'shoes') {
        className = "avatar-option__preview avatar-option__preview--shoes";
      } else if (category === 'accessories') {
        className = "avatar-option__preview avatar-option__preview--accessories";
      } else if (category === 'facial') {
        className = "avatar-option__preview avatar-option__preview--facial";
      }
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

      <div className="avatar-customization__input-container">
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
      </div>

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
        {currentOptions.map((option) => {
          // Handle subtitles
          if ('isSubtitle' in option && option.isSubtitle) {
            return (
              <div
                key={option.id}
                className="avatar-customization__subtitle"
              >
                {option.label}
              </div>
            );
          }

          const category = ('category' in option ? option.category : undefined) as 'eyewear' | 'facial' | 'headwear' | 'clothing' | 'shoes' | 'accessories' | undefined;
          const selected = isSelected(option.id, category);
          const isColor = option.id.startsWith('#');

          return (
            <button
              key={option.id}
              type="button"
              className={`avatar-option ${selected ? 'avatar-option--selected' : ''}`}
              onClick={() => handleOptionSelect(option.id, category)}
              aria-label={`Select ${option.label}`}
              style={
                isColor
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
