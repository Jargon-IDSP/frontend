export interface AvatarConfig {
  body?: string;
  expression?: string;
  hair?: string;
  headwear?: string;
  eyewear?: string;
  facial?: string;
  clothing?: string;
  shoes?: string;
  accessories?: string;
  bodyColor?: string;
  unlockedItems?: string[];
}

export interface AvatarSpriteProps {
  spriteId: string;

  className?: string;

  viewBox?: string;

  size?: number;

  width?: number;

  height?: number;

  style?: React.CSSProperties;

  dataAttributes?: Record<string, string>;

  x?: number | string;

  y?: number | string;

  spritePath?: string;

  bodyColor?: string;
}

export interface AvatarDisplayProps {
  config: AvatarConfig;
  size?: number;
  className?: string;
  onLoadingChange?: (isLoading: boolean) => void;
}


export interface AvatarProps {
  config: AvatarConfig;
  size?: number;
  className?: string;
  renderMode?: 'svg' | 'layered';
  onLoadingChange?: (isLoading: boolean) => void;
}


export interface AvatarCustomizerProps {
  context?: 'onboarding' | 'profile';
  onSave?: (config: AvatarConfig) => void;
  onBack?: () => void;
}


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

export interface AvatarOptionItem {
  id: string;
  label: string;
  category: keyof Omit<AvatarOptions, 'expressions' | 'bodyColors'>;
}

export type TabId = 'body' | 'expression' | 'hair' | 'accessories';

export interface Tab {
  id: TabId;
  label: string;
}
