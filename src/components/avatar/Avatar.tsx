import type { AvatarConfig, AvatarProps } from '../../types/avatar';

export function Avatar({ config, size = 100, className = '' }: AvatarProps) {
  // Use the body with expression if provided, otherwise use base body
  const bodyId = config.expression || config.body || 'body-1';
  const bodyColor = config.bodyColor || '#FFB6C1';

  return (
    <svg
      width={size}
      height={size}
      viewBox="-20 -20 340 340"
      className={className}
    >
      {/* Base body (includes expression if using body-X-hY format) */}
      <use
        href={`/avatar-sprites.svg#${bodyId}`}
        x="30"
        y="60"
        style={{ fill: bodyColor }}
      />

      {/* Shoes - render first so they appear behind body */}
      {config.shoes && (
        <use href={`/avatar-sprites.svg#${config.shoes}`} x="30" y="220" />
      )}

      {/* Clothing */}
      {config.clothing && (
        <use href={`/avatar-sprites.svg#${config.clothing}`} x="30" y="110" />
      )}

      {/* Hair */}
      {config.hair && (
        <use href={`/avatar-sprites.svg#${config.hair}`} x="90" y="30" />
      )}

      {/* Facial hair */}
      {config.facial && (
        <use href={`/avatar-sprites.svg#${config.facial}`} x="105" y="120" />
      )}

      {/* Eyewear */}
      {config.eyewear && (
        <use href={`/avatar-sprites.svg#${config.eyewear}`} x="80" y="85" />
      )}

      {/* Headwear - render last so it appears on top */}
      {config.headwear && (
        <use href={`/avatar-sprites.svg#${config.headwear}`} x="70" y="5" />
      )}

      {/* Additional accessories */}
      {config.accessories?.map((accessory: string, index: number) => (
        <use
          key={index}
          href={`/avatar-sprites.svg#${accessory}`}
          x="90"
          y="90"
        />
      ))}
    </svg>
  );
}

// Example usage component
export function AvatarExample() {
  const exampleConfig: AvatarConfig = {
    body: 'body-1',
    expression: 'body-1-h2', // happy expression with body-1
    hair: 'hair-1',
    headwear: 'hard-hat',
    eyewear: 'glasses',
    facial: 'beard-1',
    clothing: 'yellow-vest',
    shoes: 'shoe-1',
    accessories: ['name-tag']
  };

  return (
    <div>
      <h2>Avatar Examples</h2>
      
      {/* Small avatar */}
      <Avatar config={exampleConfig} size={50} />
      
      {/* Medium avatar */}
      <Avatar config={exampleConfig} size={100} />
      
      {/* Large avatar */}
      <Avatar config={exampleConfig} size={200} />
      
      {/* Different configuration */}
      <Avatar 
        config={{
          body: 'body-2',
          hair: 'hair-3',
          headwear: 'cap',
          clothing: 'orange-vest'
        }} 
        size={100} 
      />
    </div>
  );
}

// Helper function to get all available options
export const avatarOptions = {
  bodies: [
    'body-1', 'body-2', 'body-3', 'body-4', 'body-5',
    'body-6', 'body-7', 'body-8', 'body-9'
  ],
  expressions: {
    'body-1': ['body-1-h1', 'body-1-h2', 'body-1-h3', 'body-1-h4'],
    'body-2': ['body-2-h1', 'body-2-h2', 'body-2-h3', 'body-2-h4'],
    'body-3': ['body-3-h1', 'body-3-h2', 'body-3-h3', 'body-3-h4'],
    'body-4': ['body-4-h1', 'body-4-h2', 'body-4-h3', 'body-4-h4'],
    'body-5': ['body-5-h1', 'body-5-h2', 'body-5-h3', 'body-5-h4'],
    'body-6': ['body-6-h1', 'body-6-h2', 'body-6-h3', 'body-6-h4'],
    'body-7': ['body-7-h1', 'body-7-h2', 'body-7-h3', 'body-7-h4'],
    'body-8': ['body-8-h1', 'body-8-h2', 'body-8-h3', 'body-8-h4'],
    'body-9': ['body-9-h1', 'body-9-h2', 'body-9-h3', 'body-9-h4']
  },
  hair: ['hair-1', 'hair-2', 'hair-3', 'hair-4', 'hair-5', 'hair-6', 'hair-7'],
  headwear: ['cap', 'hard-hat', 'round-hat', 'round-hat-2'],
  eyewear: ['glasses', 'welding-mask', 'orange-mask'],
  facial: ['beard-1', 'beard-2', 'beard-3'],
  clothing: ['yellow-vest', 'orange-vest'],
  shoes: ['shoe-1', 'shoe-2', 'shoe-3'],
  accessories: ['name-tag', 'beauty-spot', 'blush', 'lashes-1', 'lashes-2'],
  bodyColors: [
    '#FFB6C1', // Light Pink (default)
    '#FF69B4', // Hot Pink
    '#FFA07A', // Light Salmon
    '#FFD700', // Gold
    '#98FB98', // Pale Green
    '#87CEEB', // Sky Blue
    '#DDA0DD', // Plum
    '#F0E68C', // Khaki
    '#D2691E', // Chocolate
    '#A0522D', // Sienna
  ]
};

export default Avatar;