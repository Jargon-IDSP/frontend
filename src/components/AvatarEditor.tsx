import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  SHAPES,
  HAIR,
  HEADWEAR,
  UNIFORMS,
  SHOES,
  EYEWEAR,
  FACIAL_HAIR,
  MAKEUP,
  COLORS,
  DEFAULT_AVATAR
} from '../config/avatarConfig';
import type { AvatarSelection } from '../config/avatarConfig';
import { composeLayers, svgToDataURL } from '../utils/avatarComposer';

interface AvatarEditorProps {
  initialSelection?: AvatarSelection;
  onSave: (selection: AvatarSelection) => void;
  onClose?: () => void;
}

type Tab = 'shape' | 'hair' | 'features';

export default function AvatarEditor({ initialSelection, onSave, onClose }: AvatarEditorProps) {
  const [activeTab, setActiveTab] = useState<Tab>('shape');
  const [selection, setSelection] = useState<AvatarSelection>(() => {
    const initial = initialSelection || DEFAULT_AVATAR;
    // Ensure shapeColor is always set
    return {
      ...initial,
      shapeColor: initial.shapeColor || '#f3cfb0'
    };
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  // Update preview whenever selection changes
  useEffect(() => {
    const updatePreview = async () => {
      setIsComposing(true);
      try {
        const compositeSVG = await composeLayers(selection);
        const dataUrl = svgToDataURL(compositeSVG);
        setPreviewUrl(dataUrl);
      } catch (error) {
        console.error('Failed to compose avatar preview:', error);
      } finally {
        setIsComposing(false);
      }
    };

    updatePreview();
  }, [selection]);

  const handleSave = () => {
    onSave(selection);
  };

  const handleReset = () => {
    setSelection(DEFAULT_AVATAR);
  };

  const updateSelection = (key: keyof AvatarSelection, value: number | string | null) => {
    setSelection(prev => ({ ...prev, [key]: value }));
  };

  // Helper to toggle feature selection (deselect if clicking the same item)
  const toggleFeatureSelection = (
    featureKey: 'hair' | 'headwear' | 'uniform' | 'shoes' | 'eyewear' | 'facialHair' | 'makeup',
    colorKey: 'hairColor' | 'headwearColor' | 'uniformColor' | 'shoesColor' | 'eyewearColor' | 'facialHairColor' | 'makeupColor',
    value: number
  ) => {
    setSelection(prev => {
      // If clicking the same item, deselect it
      if (prev[featureKey] === value) {
        return {
          ...prev,
          [featureKey]: null,
          [colorKey]: null,
        };
      }
      // Otherwise, select the new item
      // Keep existing color for this feature if switching between items
      // DON'T set a default color - let the SVG use its original color
      const existingColor = prev[colorKey];
      return {
        ...prev,
        [featureKey]: value,
        // Keep the existing color (which might be null), don't force a default
        [colorKey]: existingColor,
      };
    });
  };

  // Helper to render color picker
  const renderColorPicker = (selectedColor: string | null, onColorSelect: (color: string) => void) => (
    <div className="color-picker">
      <p className="color-label">Color:</p>
      <div className="color-grid">
        {COLORS.map((color) => (
          <div
            key={color.id}
            className={`color-option ${selectedColor === color.hex ? 'selected' : ''}`}
            style={{ backgroundColor: color.hex }}
            onClick={() => onColorSelect(color.hex)}
            title={color.name}
          />
        ))}
      </div>
    </div>
  );

  const renderShapeTab = () => (
    <div className="tab-content-with-colors">
      <h3>Select Shape</h3>
      <div className="avatar-grid">
        {SHAPES.map((shape) => (
          <div
            key={shape.id}
            className={`avatar-option ${selection.shape === shape.id ? 'selected' : ''}`}
            onClick={() => {
              updateSelection('shape', shape.id);
              // Ensure shape always has a color
              if (!selection.shapeColor) {
                updateSelection('shapeColor', '#f3cfb0');
              }
            }}
          >
            <img
              src={`/avatars/shapes/${shape.file}`}
              alt={shape.name}
              className="avatar-asset"
            />
          </div>
        ))}
      </div>
      {renderColorPicker(selection.shapeColor, (color) => updateSelection('shapeColor', color))}
    </div>
  );

  const renderHairTab = () => (
    <div className="tab-content-with-colors">
      <h3>Select Hairstyle (click again to remove)</h3>
      <div className="avatar-grid">
        {HAIR.map((hair) => (
          <div
            key={hair.id}
            className={`avatar-option ${selection.hair === hair.id ? 'selected' : ''}`}
            onClick={() => toggleFeatureSelection('hair', 'hairColor', hair.id)}
          >
            <img
              src={`/avatars/hair/${hair.file}`}
              alt={hair.name}
              className="avatar-asset"
            />
          </div>
        ))}
      </div>
      {selection.hair && renderColorPicker(selection.hairColor, (color) => updateSelection('hairColor', color))}
    </div>
  );

  const renderFeaturesTab = () => (
    <div className="features-container">
      <div className="feature-category">
        <h3>Headwear (click again to remove)</h3>
        <div className="avatar-grid">
          {HEADWEAR.map((item) => (
            <div
              key={item.id}
              className={`avatar-option ${selection.headwear === item.id ? 'selected' : ''}`}
              onClick={() => toggleFeatureSelection('headwear', 'headwearColor', item.id)}
            >
              <img
                src={`/avatars/headwear/${item.file}`}
                alt={item.name}
                className="avatar-asset"
              />
            </div>
          ))}
        </div>
        {selection.headwear && renderColorPicker(selection.headwearColor, (color) => updateSelection('headwearColor', color))}
      </div>

      <div className="feature-category">
        <h3>Uniform (click again to remove)</h3>
        <div className="avatar-grid">
          {UNIFORMS.map((item) => (
            <div
              key={item.id}
              className={`avatar-option ${selection.uniform === item.id ? 'selected' : ''}`}
              onClick={() => toggleFeatureSelection('uniform', 'uniformColor', item.id)}
            >
              <img
                src={`/avatars/uniform/${item.file}`}
                alt={item.name}
                className="avatar-asset"
              />
            </div>
          ))}
        </div>
        {selection.uniform && renderColorPicker(selection.uniformColor, (color) => updateSelection('uniformColor', color))}
      </div>

      <div className="feature-category">
        <h3>Shoes (click again to remove)</h3>
        <div className="avatar-grid">
          {SHOES.map((item) => (
            <div
              key={item.id}
              className={`avatar-option ${selection.shoes === item.id ? 'selected' : ''}`}
              onClick={() => toggleFeatureSelection('shoes', 'shoesColor', item.id)}
            >
              <img
                src={`/avatars/shoes/${item.file}`}
                alt={item.name}
                className="avatar-asset"
              />
            </div>
          ))}
        </div>
        {selection.shoes && renderColorPicker(selection.shoesColor, (color) => updateSelection('shoesColor', color))}
      </div>

      <div className="feature-category">
        <h3>Eyewear (click again to remove)</h3>
        <div className="avatar-grid">
          {EYEWEAR.map((item) => (
            <div
              key={item.id}
              className={`avatar-option ${selection.eyewear === item.id ? 'selected' : ''}`}
              onClick={() => toggleFeatureSelection('eyewear', 'eyewearColor', item.id)}
            >
              <img
                src={`/avatars/eyewear/${item.file}`}
                alt={item.name}
                className="avatar-asset"
              />
            </div>
          ))}
        </div>
        {selection.eyewear && renderColorPicker(selection.eyewearColor, (color) => updateSelection('eyewearColor', color))}
      </div>

      <div className="feature-category">
        <h3>Facial Hair (click again to remove)</h3>
        <div className="avatar-grid">
          {FACIAL_HAIR.map((item) => (
            <div
              key={item.id}
              className={`avatar-option ${selection.facialHair === item.id ? 'selected' : ''}`}
              onClick={() => toggleFeatureSelection('facialHair', 'facialHairColor', item.id)}
            >
              <img
                src={`/avatars/facial-hair/${item.file}`}
                alt={item.name}
                className="avatar-asset"
              />
            </div>
          ))}
        </div>
        {selection.facialHair && renderColorPicker(selection.facialHairColor, (color) => updateSelection('facialHairColor', color))}
      </div>

      <div className="feature-category">
        <h3>Makeup (click again to remove)</h3>
        <div className="avatar-grid">
          {MAKEUP.map((item) => (
            <div
              key={item.id}
              className={`avatar-option ${selection.makeup === item.id ? 'selected' : ''}`}
              onClick={() => toggleFeatureSelection('makeup', 'makeupColor', item.id)}
            >
              <img
                src={`/avatars/makeup/${item.file}`}
                alt={item.name}
                className="avatar-asset"
              />
            </div>
          ))}
        </div>
        {selection.makeup && renderColorPicker(selection.makeupColor, (color) => updateSelection('makeupColor', color))}
      </div>
    </div>
  );

  return (
    <div className="avatar-editor-modal">
      <div className="avatar-editor-content">
        <div className="avatar-editor-header">
          <h2>Your Avatar</h2>
          {onClose && (
            <button className="close-button" onClick={onClose}>
              <X size={24} />
            </button>
          )}
        </div>

        <div className="avatar-preview">
          {isComposing ? (
            <div className="avatar-preview-loading">
              <p>Composing...</p>
            </div>
          ) : previewUrl ? (
            <img src={previewUrl} alt="Avatar Preview" className="avatar-preview-image" />
          ) : (
            <div className="avatar-preview-placeholder">
              <span className="preview-emoji">👤</span>
            </div>
          )}
        </div>

        <div className="avatar-tabs">
          <button
            className={`avatar-tab ${activeTab === 'shape' ? 'active' : ''}`}
            onClick={() => setActiveTab('shape')}
          >
            Shape
          </button>
          <button
            className={`avatar-tab ${activeTab === 'hair' ? 'active' : ''}`}
            onClick={() => setActiveTab('hair')}
          >
            Hair
          </button>
          <button
            className={`avatar-tab ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => setActiveTab('features')}
          >
            Features
          </button>
          <button
            className="avatar-tab avatar-reset-button"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>

        <div className="avatar-options-container">
          {activeTab === 'shape' && renderShapeTab()}
          {activeTab === 'hair' && renderHairTab()}
          {activeTab === 'features' && renderFeaturesTab()}
        </div>

        <button className="avatar-save-button" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
}
