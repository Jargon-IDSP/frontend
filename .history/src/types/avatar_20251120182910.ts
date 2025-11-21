/**
 * Avatar configuration interface
 * Defines the structure for user avatar customization
 */
export interface AvatarConfig {
  body?: string;           // e.g., 'body-1', 'body-2', etc.
  expression?: string;     // e.g., 'body-1-h1' (h1 = happy expression)
  hair?: string;           // e.g., 'hair-1', 'hair-2', etc.
  headwear?: string;       // e.g., 'cap', 'hard-hat', 'round-hat'
  eyewear?: string;        // e.g., 'glasses', 'welding-mask', 'orange-mask'
  facial?: string;         // e.g., 'beard-1', 'beard-2', 'beard-3'
  clothing?: string;       // e.g., 'yellow-vest', 'orange-vest'
  shoes?: string;          // e.g., 'shoe-1', 'shoe-2', 'shoe-3'
  accessories?: string[];  // e.g., ['name-tag', 'beauty-spot', 'blush']
  bodyColor?: string;      // Hex color for body, e.g., '#FFB6C1'
  unlockedItems?: string[]; // Array of unlocked item IDs
}

/**
 * Props for Avatar component
 */
export interface AvatarProps {
  config: AvatarConfig;
  size?: number;           // Size in pixels, default 100
  className?: string;      // Additional CSS classes
  renderMode?: 'svg' | 'layered'; // Rendering mode: svg (SVG coordinates) or layered (CSS positioning)
}

/**
 * Props for AvatarCustomizer component
 */
export interface AvatarCustomizerProps {
  context?: 'onboarding' | 'profile';
  onSave?: (config: AvatarConfig) => void;
  onBack?: () => void;
}

/**
 * Available avatar options configuration
 */
export interface AvatarOptions {
  bodies: string[];
  expressions: Record<string, string[]>;
  hair: string[];
  headwear: string[];
  eyewear: string[];
  facial: string[];
  clothing: string[];
  shoes: string[];
  accessories: string[];
  bodyColors: string[];
}

/**
 * Avatar option item for UI rendering
 */
export interface AvatarOptionItem {
  id: string;
  label: string;
  category: keyof Omit<AvatarOptions, 'expressions' | 'bodyColors'>;
}

/**
 * Tab configuration for AvatarCustomizer
 */
export type TabId = 'body' | 'expression' | 'hair' | 'headwear' | 'features' | 'clothing' | 'shoes' | 'color';

export interface Tab {
  id: TabId;
  label: string;
}
