import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/pages/_avatarCustomization.scss';

import shape01 from '../../assets/avatarCustomization/avatarShape/avatarShape01.svg';
import shape02 from '../../assets/avatarCustomization/avatarShape/avatarShape02.svg';
import shape03 from '../../assets/avatarCustomization/avatarShape/avatarShape03.svg';
import shape04 from '../../assets/avatarCustomization/avatarShape/avatarShape04.svg';
import shape05 from '../../assets/avatarCustomization/avatarShape/avatarShape05.svg';
import shape06 from '../../assets/avatarCustomization/avatarShape/avatarShape06.svg';
import shape07 from '../../assets/avatarCustomization/avatarShape/avatarShape07.svg';
import shape08 from '../../assets/avatarCustomization/avatarShape/avatarShape08.svg';
import shape09 from '../../assets/avatarCustomization/avatarShape/avatarShape09.svg';

import hair01 from '../../assets/avatarCustomization/features/hair/hair01.svg';
import hair02 from '../../assets/avatarCustomization/features/hair/hair02.svg';
import hair03 from '../../assets/avatarCustomization/features/hair/hair03.svg';
import hair04 from '../../assets/avatarCustomization/features/hair/hair04.svg';
import hair05 from '../../assets/avatarCustomization/features/hair/hair05.svg';
import hair06 from '../../assets/avatarCustomization/features/hair/hair06.svg';
import hair07 from '../../assets/avatarCustomization/features/hair/hair07.svg';

import feature01 from '../../assets/avatarCustomization/features/facialHair/facialHair01.svg';
import feature02 from '../../assets/avatarCustomization/features/facialHair/facialHair02.svg';
import feature03 from '../../assets/avatarCustomization/features/facialHair/facialHair03.svg';

import shoe01 from '../../assets/avatarCustomization/accessories/shoes/shoes01.svg';
import shoe02 from '../../assets/avatarCustomization/accessories/shoes/shoes02.svg';
import shoe03 from '../../assets/avatarCustomization/accessories/shoes/shoes03.svg';

type TabId = 'shape' | 'hair' | 'features' | 'shoes';

interface AvatarOption {
  id: string;
  label: string;
  image?: string;
  isNone?: boolean;
}

const shapeOptions: AvatarOption[] = [
  { id: 'shape-01', label: 'Shape 1', image: shape01 },
  { id: 'shape-02', label: 'Shape 2', image: shape02 },
  { id: 'shape-03', label: 'Shape 3', image: shape03 },
  { id: 'shape-04', label: 'Shape 4', image: shape04 },
  { id: 'shape-05', label: 'Shape 5', image: shape05 },
  { id: 'shape-06', label: 'Shape 6', image: shape06 },
  { id: 'shape-07', label: 'Shape 7', image: shape07 },
  { id: 'shape-08', label: 'Shape 8', image: shape08 },
  { id: 'shape-09', label: 'Shape 9', image: shape09 },
];

const hairOptions: AvatarOption[] = [
  { id: 'hair-01', label: 'Hair 1', image: hair01 },
  { id: 'hair-02', label: 'Hair 2', image: hair02 },
  { id: 'hair-03', label: 'Hair 3', image: hair03 },
  { id: 'hair-04', label: 'Hair 4', image: hair04 },
  { id: 'hair-05', label: 'Hair 5', image: hair05 },
  { id: 'hair-06', label: 'Hair 6', image: hair06 },
  { id: 'hair-07', label: 'Hair 7', image: hair07 },
];

const featureOptions: AvatarOption[] = [
  { id: 'feature-01', label: 'Brows', image: feature01 },
  { id: 'feature-02', label: 'Mustache', image: feature02 },
  { id: 'feature-03', label: 'Goatee', image: feature03 },
];

const shoeOptions: AvatarOption[] = [
  { id: 'shoe-01', label: 'Boots', image: shoe01 },
  { id: 'shoe-02', label: 'Sneakers', image: shoe02 },
  { id: 'shoe-03', label: 'Clogs', image: shoe03 },
];

const createNoneOption = (tabId: TabId): AvatarOption => ({
  id: `${tabId}-none`,
  label: 'None',
  isNone: true,
});

const tabs: { id: TabId; label: string; options: AvatarOption[] }[] = [
  { id: 'shape', label: 'Shape', options: shapeOptions },
  { id: 'hair', label: 'Hair', options: [createNoneOption('hair'), ...hairOptions] },
  { id: 'features', label: 'Features', options: [createNoneOption('features'), ...featureOptions] },
  { id: 'shoes', label: 'Shoes', options: [createNoneOption('shoes'), ...shoeOptions] },
];

type AvatarSelections = {
  shape: AvatarOption;
  hair: AvatarOption | null;
  features: AvatarOption | null;
  shoes: AvatarOption | null;
};

export default function AvatarCustomization() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('shape');
  const [userName, setUserName] = useState('');
  const [selections, setSelections] = useState<AvatarSelections>({
    shape: shapeOptions[1],
    hair: null,
    features: null,
    shoes: null,
  });

  const activeTabConfig = useMemo(
    () => tabs.find((tab) => tab.id === activeTab) ?? tabs[0],
    [activeTab]
  );

  const handleOptionSelect = (tabId: TabId, option: AvatarOption) => {
    if (option.isNone) {
      // Shape cannot be null, so only allow None for other tabs
      if (tabId !== 'shape') {
        setSelections((prev) => ({ ...prev, [tabId]: null }));
      }
      return;
    }
    setSelections((prev) => ({ ...prev, [tabId]: option }));
  };

  const handleNext = () => {
    const payload = {
      userName: userName.trim(),
      selections,
    };
    sessionStorage.setItem('avatarCustomization', JSON.stringify(payload));
    navigate('/');
  };

  return (
    <div className="avatar-customization">
      <div className="avatar-customization__status-bar">
        <span>19:02</span>
        <div className="avatar-customization__status-icons">
          <span className="status-dot" />
          <span className="status-signal" />
          <span className="status-battery" />
        </div>
      </div>

      <div className="avatar-customization__top">
        <button
          type="button"
          className="avatar-customization__back"
          onClick={() => navigate('/onboarding/industry')}
          aria-label="Go back"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>
        <div className="avatar-customization__progress">
          <div className="avatar-customization__progress-fill" />
        </div>
      </div>
      <h1>Create your own Rocky!</h1>

      <div className="avatar-customization__preview">
        <div className="avatar-customization__canvas">
          <img
            src={selections.shape.image}
            alt="Avatar shape"
            className="avatar-layer avatar-layer--shape"
          />
          {selections.hair && (
            <img
              src={selections.hair.image}
              alt="Avatar hair"
              className="avatar-layer avatar-layer--hair"
            />
          )}
          {selections.features && (
            <img
              src={selections.features.image}
              alt="Avatar feature"
              className="avatar-layer avatar-layer--feature"
            />
          )}
          {selections.shoes && (
            <img
              src={selections.shoes.image}
              alt="Avatar shoes"
              className="avatar-layer avatar-layer--shoes"
            />
          )}
        </div>
      </div>

      <label className="avatar-customization__input-label" htmlFor="avatarName">
        User Name
      </label>
      <input
        id="avatarName"
        type="text"
        className="avatar-customization__input"
        placeholder="Enter a nickname"
        value={userName}
        onChange={(event) => setUserName(event.target.value)}
      />

      <div className="avatar-customization__tabs">
        {tabs.map((tab) => (
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
        {activeTabConfig.options.map((option) => {
          const selected = selections[activeTabConfig.id];
          const isSelected = option.isNone
            ? selected === null
            : selected?.id === option.id;
          return (
            <button
              key={option.id}
              type="button"
              className={`avatar-option ${isSelected ? 'avatar-option--selected' : ''}`}
              onClick={() => handleOptionSelect(activeTabConfig.id, option)}
            >
              {option.image ? (
                <img src={option.image} alt={option.label} />
              ) : (
                <span className="avatar-option__label">{option.label}</span>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="avatar-customization__next"
        onClick={handleNext}
      >
        Next
      </button>
    </div>
  );
}

