import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { avatarOptions } from './Avatar';
import { AvatarDisplay } from './AvatarDisplay';
import { AvatarSprite } from './AvatarSprite';
import { getBodyViewBox } from './bodyViewBoxes';
import type { AvatarConfig, AvatarCustomizerProps, Tab, TabId } from '../../types/avatar';
import { useAvatar } from '../../hooks/useAvatar';
import { useUser } from '@clerk/clerk-react';
import LoadingBar from '../LoadingBar';

const BODY_COLOR_CLASSES = [
  'st17', 'st18', 'st19', 'st20', 'st21', 'st22', 'st23', 'st24',
  'st25', 'st26', 'st27', 'st30', 'st31', 'st32', 'st33', 'st34', 'st49'
];

const symbolCache = new Map<string, string>();

async function fetchColoredSymbol(symbolId: string, bodyColor: string): Promise<string | null> {
  const cacheKey = `${symbolId}-${bodyColor}`;
  
  if (symbolCache.has(cacheKey)) {
    return symbolCache.get(cacheKey)!;
  }

  try {
    const response = await fetch('/avatar-sprites.svg');
    const svgText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const symbol = doc.getElementById(symbolId);
    if (!symbol) return null;

    let content = symbol.innerHTML;

    BODY_COLOR_CLASSES.forEach(className => {
      const regex = new RegExp(`class="${className}"`, 'g');
      content = content.replace(regex, `class="${className}" fill="${bodyColor}"`);
    });

    symbolCache.set(cacheKey, content);
    return content;
  } catch (error) {
    console.error('Failed to fetch symbol:', error);
    return null;
  }
}

function BodyPreview({ spriteId, bodyColor, className, viewBox }: {
  spriteId: string;
  bodyColor: string;
  className: string;
  viewBox: string;
}) {
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    
    fetchColoredSymbol(spriteId, bodyColor).then(result => {
      if (result && mounted) {
        setContent(result);
      }
    });

    return () => {
      mounted = false;
    };
  }, [spriteId, bodyColor]);

  if (!content) {
    return <div className={className} />;
  }

  return (
    <svg
      className={className}
      viewBox={viewBox}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

async function fetchColoredHair(symbolId: string, hairColor: string, isFacial: boolean = false): Promise<{ content: string; viewBox: string; hasBlackStroke: boolean } | null> {
  try {
    const response = await fetch('/avatar-sprites.svg');
    const svgText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const symbol = doc.getElementById(symbolId);
    if (!symbol) return null;

    let content = symbol.innerHTML;
    const viewBox = symbol.getAttribute('viewBox') || '0 0 300 300';
    const hasBlackStroke = /stroke="#000000"|stroke="#000"|stroke="black"/i.test(content);

    const HAIR_COLORS = isFacial
      ? ['#512e14', '#5b3319', '#602d0b']
      : ['#512e14', '#5b3319'];

    HAIR_COLORS.forEach(originalColor => {
      const regex = new RegExp(`fill="${originalColor}"`, 'g');
      content = content.replace(regex, `fill="${hairColor}"`);
    });

    content = content.replace(/\s*stroke="(?!#000000|#000|black)[^"]*"/gi, '');
    content = content.replace(/\s*stroke-width="[^"]*"/g, '');

    return { content, viewBox, hasBlackStroke };
  } catch (error) {
    console.error('Failed to fetch hair symbol:', error);
    return null;
  }
}

function HairPreview({ spriteId, hairColor, className, isFacial = false }: {
  spriteId: string;
  hairColor: string;
  className: string;
  isFacial?: boolean;
}) {
  const [data, setData] = useState<{ content: string; viewBox: string; hasBlackStroke: boolean } | null>(null);

  useEffect(() => {
    fetchColoredHair(spriteId, hairColor, isFacial).then(result => {
      if (result) setData(result);
    });
  }, [spriteId, hairColor, isFacial]);

  if (!data) return null;

  const strokeStyle = data.hasBlackStroke ? {} : { stroke: '#000000', strokeWidth: '1px' };

  return (
    <svg
      className={className}
      viewBox={data.viewBox}
      dangerouslySetInnerHTML={{ __html: data.content }}
      style={strokeStyle}
    />
  );
}

// This is how the tabs are defined in the frontend
const tabs: Tab[] = [
  { id: 'body', label: 'Body' },
  { id: 'expression', label: 'Expression' },
  { id: 'hair', label: 'Hair' },
  { id: 'accessories', label: 'Accessories' },
];

export function AvatarCustomizer({ context = 'profile', onSave: onSaveCallback }: AvatarCustomizerProps = {}) {
  const { user } = useUser();
  const { avatar, isLoading, updateAvatar, isUpdating } = useAvatar();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabId>('body');
  const [config, setConfig] = useState<AvatarConfig>({
    body: 'body-1',
    bodyColor: '#ffba0a',
    hairColor: '#512e14',
    expression: 'body-1-h1',
  });
  const [selectedBody, setSelectedBody] = useState('body-1');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [avatarReady, setAvatarReady] = useState(false);

  useEffect(() => {
    if (avatar) {
      setAvatarReady(false); 
      setConfig(avatar);
      setSelectedBody(avatar.body || 'body-1');
      
      const timer = setTimeout(() => {
        setAvatarReady(true);
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [avatar]);

  const updateConfig = (key: keyof AvatarConfig, value: string | undefined) => {
    setConfig(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  useEffect(() => {
    const noHairHeadwear = config.headwear &&
      (config.headwear === 'round-hat' ||
       config.headwear === 'round-hat-2' ||
       config.headwear === 'round-hat-3');
    const noHairEyewear = config.eyewear &&
      (config.eyewear === 'orange-mask' || config.eyewear === 'orange-mask-2');

    const restrictiveHeadwear = config.headwear &&
      (config.headwear === 'hard-hat' || config.headwear === 'cap');

    if ((noHairHeadwear || noHairEyewear) && config.hair) {
      updateConfig('hair', undefined);
    }

    if (restrictiveHeadwear && config.hair &&
        config.hair !== 'hair-1' && config.hair !== 'hair-7') {
      updateConfig('hair', 'hair-1');
    }
  }, [config.headwear, config.eyewear, config.hair]);

  useEffect(() => {
    if (config.expression && config.expression.includes('-h1') && config.facial) {
      updateConfig('facial', undefined);
    }
  }, [config.expression, config.facial]);

  useEffect(() => {
    if (config.facial && config.expression && config.expression.includes('-h1')) {
      const baseBody = config.expression.split('-').slice(0, 2).join('-');
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

        if (context === 'profile') {
          setTimeout(() => {
            navigate('/profile');
          }, 800);
        }
      },
    });
  };

  const handleReset = () => {
    setConfig(prev => ({
      body: prev.body,
      expression: prev.expression,
      bodyColor: prev.bodyColor,
      hair: undefined,
      headwear: undefined,
      eyewear: undefined,
      facial: undefined,
      clothing: undefined,
      shoes: undefined,
      accessories: undefined,
    }));
  };

  const currentOptions = useMemo(() => {
    switch (activeTab) {
      case 'body':
        return [
          { id: '__subtitle__', label: 'Shape', isSubtitle: true },
          ...avatarOptions.bodies.map(id => ({ id, label: id })),
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
        const noHairHeadwear = config.headwear &&
          (config.headwear === 'round-hat' ||
           config.headwear === 'round-hat-2' ||
           config.headwear === 'round-hat-3');
        const noHairEyewear = config.eyewear &&
          (config.eyewear === 'orange-mask' || config.eyewear === 'orange-mask-2');

        if (noHairHeadwear || noHairEyewear) {
          var hairOptions: string[] = [];
        } else {
          const restrictiveHeadwear = config.headwear &&
            (config.headwear === 'hard-hat' || config.headwear === 'cap');
          var hairOptions = restrictiveHeadwear
            ? avatarOptions.hair.filter(id => id === 'hair-1' || id === 'hair-7')
            : avatarOptions.hair;
        }
        const facialOptions = (config.expression && config.expression.includes('-h1'))
          ? avatarOptions.facial.filter(id => !id.startsWith('beard-'))
          : avatarOptions.facial;

        return [
          { id: '__subtitle__hair__', label: 'Hair', isSubtitle: true },
          { id: 'none-hair', label: 'None' },
          ...hairOptions.map(id => ({ id, label: id })),
          { id: '__subtitle__facial__', label: 'Facial Hair', isSubtitle: true },
          { id: 'none-facial', label: 'None', category: 'facial' as const },
          ...facialOptions.map(id => ({ id, label: id, category: 'facial' as const })),
          { id: '__subtitle__haircolor__', label: 'Hair Color', isSubtitle: true },
          ...avatarOptions.hairColors.map(color => ({
            id: color,
            label: color,
            category: 'hairColor' as const
          }))
        ];
      case 'accessories':
        const eyewearOptions = avatarOptions.eyewear.filter(id => id !== 'orange-mask' && id !== 'orange-mask-2');
        
        return [
          { id: '__subtitle__eyewear__', label: 'Eyewear', isSubtitle: true },
          { id: 'none-eyewear', label: 'None', category: 'eyewear' as const },
          ...eyewearOptions.map(id => ({ id, label: id, category: 'eyewear' as const })),
          { id: '__subtitle__headwear__', label: 'Headwear', isSubtitle: true },
          { id: 'none-headwear', label: 'None', category: 'headwear' as const },
          ...avatarOptions.headwear.map(id => ({ id, label: id, category: 'headwear' as const })),
          { id: '__subtitle__clothing__', label: 'Clothing', isSubtitle: true },
          { id: 'none-clothing', label: 'None', category: 'clothing' as const },
          ...avatarOptions.clothing
            .filter(id => id !== 'yellow-vest' && id !== 'orange-vest')
            .map(id => ({ id, label: id, category: 'clothing' as const })),
          { id: '__subtitle__shoes__', label: 'Shoes', isSubtitle: true },
          { id: 'none-shoes', label: 'None', category: 'shoes' as const },
          ...avatarOptions.shoes.map(id => ({ id, label: id, category: 'shoes' as const })),
          { id: '__subtitle__accessories__', label: 'Make up', isSubtitle: true },
          { id: 'none-accessories', label: 'None', category: 'accessories' as const },
          ...avatarOptions.accessories.map(id => ({ id, label: id, category: 'accessories' as const }))
        ];
      default:
        return [];
    }
  }, [activeTab, selectedBody, config.headwear, config.facial, config.expression]);

  const handleOptionSelect = (optionId: string, category?: 'eyewear' | 'facial' | 'headwear' | 'clothing' | 'shoes' | 'accessories' | 'hairColor') => {
    // Ignore subtitle clicks
    if (optionId.startsWith('__subtitle__')) {
      return;
    }

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
      } else if (category === 'hairColor' || optionId.startsWith('#')) {
        updateConfig('hairColor', optionId);
      } else {
        updateConfig('hair', optionId);
      }
    } else if (activeTab === 'accessories') {
      if (category === 'eyewear') {
        updateConfig('eyewear', optionId);
      } else if (category === 'headwear') {
        if (optionId === 'orange-mask' || optionId === 'orange-mask-2') {
          updateConfig('eyewear', optionId);
          updateConfig('headwear', undefined);
        } else {
          updateConfig('headwear', optionId);
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

  const isSelected = (optionId: string, category?: 'eyewear' | 'facial' | 'headwear' | 'clothing' | 'shoes' | 'accessories' | 'hairColor') => {
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
      } else if (category === 'hairColor' || optionId.startsWith('#')) {
        return config.hairColor === optionId;
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

  const renderOptionPreview = (optionId: string, category?: 'eyewear' | 'facial' | 'headwear' | 'clothing' | 'shoes' | 'accessories' | 'hairColor') => {
    if (optionId === 'none' || optionId.startsWith('none-')) {
      return <span className="avatar-option__label">None</span>;
    }

    if (optionId.startsWith('#')) {
      return null;
    }

    let className = "avatar-option__preview";
    let viewBox = "0 0 300 300";
    let bodyColor: string | undefined;
    let hairColor: string | undefined;

    if (activeTab === 'body') {
      if (!optionId.startsWith('#')) {
        className = "avatar-option__preview avatar-option__preview--body";
        viewBox = getBodyViewBox(optionId);
        bodyColor = config.bodyColor || '#ffba0a';
      }
    } else if (activeTab === 'expression') {
      className = "avatar-option__preview avatar-option__preview--body";
      viewBox = getBodyViewBox(optionId);
      bodyColor = config.bodyColor || '#ffba0a';
    } else if (activeTab === 'hair') {
      if (category === 'facial') {
        className = "avatar-option__preview avatar-option__preview--facial";
        hairColor = config.hairColor || '#512e14';
      } else {
        className = "avatar-option__preview avatar-option__preview--hair";
        hairColor = config.hairColor || '#512e14';
      }
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

    if (bodyColor) {
      return (
        <BodyPreview
          spriteId={optionId}
          bodyColor={bodyColor}
          className={className}
          viewBox={viewBox}
        />
      );
    }

    if (hairColor) {
      return (
        <HairPreview
          spriteId={optionId}
          hairColor={hairColor}
          className={className}
          isFacial={category === 'facial'}
        />
      );
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
      <LoadingBar isLoading={isLoading || !avatarReady} hasData={!!avatar} text="Loading avatar" />

      <div className="avatar-customization__preview">
        {!isLoading && avatarReady && <AvatarDisplay config={config} size={210} />}
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

          const category = ('category' in option ? option.category : undefined) as 'eyewear' | 'facial' | 'headwear' | 'clothing' | 'shoes' | 'accessories' | 'hairColor' | undefined;
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
          ? 'Finish'
          : 'Save'}
      </button>

      <button
        type="button"
        className="avatar-customization__reset"
        onClick={handleReset}
      >
        Reset Accessories
      </button>
    </div>
  );
}

export default AvatarCustomizer;