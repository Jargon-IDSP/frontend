import { useEffect, useRef, useState } from 'react';
import type { AvatarProps } from '../../types/avatar';
import { AvatarSprite } from './AvatarSprite';
import { getBodyViewBox, toDataAttributeId } from './bodyViewBoxes';


async function fetchSymbolContent(symbolId: string): Promise<string | null> {
  try {
    const response = await fetch('/avatar-sprites.svg');
    const svgText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const symbol = doc.getElementById(symbolId);
    if (!symbol) return null;
    return symbol.innerHTML;
  } catch (error) {
    console.error('Failed to fetch symbol:', error);
    return null;
  }
}

export function Avatar({ config, size = 100, className = '', renderMode = 'svg' }: AvatarProps) {
  const bodyId = config.expression || config.body || 'body-1';
  const bodyColor = config.bodyColor || '#ffba0a';

  if (renderMode === 'layered') {
    const hairDataId = config.hair ? toDataAttributeId(config.hair, 'hair') : undefined;
    const bodySvgRef = useRef<SVGSVGElement>(null);
    const [bodyContent, setBodyContent] = useState<string>('');

    useEffect(() => {
      fetchSymbolContent(bodyId).then(content => {
        if (content) {
          const coloredContent = content
            .replace(/class="cls-21"/g, `class="cls-21" fill="${bodyColor}"`)
            .replace(/class="cls-5"/g, `class="cls-5" fill="${bodyColor}"`);
          setBodyContent(coloredContent);
        }
      });
    }, [bodyId, bodyColor]);

    return (
      <>
        <div className="avatar-customization__shape-container">
          <svg
            ref={bodySvgRef}
            className="avatar-layer avatar-layer--shape"
            viewBox={getBodyViewBox(bodyId)}
            dangerouslySetInnerHTML={{ __html: bodyContent }}
          />
        </div>

        {config.shoes && (
          <AvatarSprite
            spriteId={config.shoes}
            className="avatar-layer avatar-layer--shoes"
            dataAttributes={{ 'data-shoes': toDataAttributeId(config.shoes, 'shoes') }}
          />
        )}

        {config.hair && (
          <AvatarSprite
            spriteId={config.hair}
            className="avatar-layer avatar-layer--hair"
            dataAttributes={hairDataId ? { 'data-hair': hairDataId } : undefined}
          />
        )}

        {config.facial && (
          <AvatarSprite
            spriteId={config.facial}
            className="avatar-layer avatar-layer--feature"
            dataAttributes={{ 'data-facial': toDataAttributeId(config.facial, 'facial') }}
          />
        )}

        {config.eyewear && (
          <AvatarSprite
            spriteId={config.eyewear}
            className="avatar-layer avatar-layer--eyewear"
          />
        )}

        {config.headwear && (
          <AvatarSprite
            spriteId={config.headwear}
            className="avatar-layer avatar-layer--headwear"
          />
        )}

        {config.clothing && (
          <AvatarSprite
            spriteId={config.clothing}
            className="avatar-layer avatar-layer--clothing"
          />
        )}
      </>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="-20 -20 340 340"
      className={className}
    >
      <use
        href={`/avatar-sprites.svg#${bodyId}`}
        x="30"
        y="60"
        style={{ fill: bodyColor }}
      />

      {config.shoes && (
        <AvatarSprite spriteId={config.shoes} x={30} y={220} />
      )}

      {config.clothing && (
        <AvatarSprite spriteId={config.clothing} x={30} y={110} />
      )}

      {config.hair && (
        <AvatarSprite spriteId={config.hair} x={90} y={30} />
      )}

      {config.facial && (
        <AvatarSprite spriteId={config.facial} x={105} y={120} />
      )}

      {config.eyewear && (
        <AvatarSprite spriteId={config.eyewear} x={80} y={85} />
      )}

      {config.headwear && (
        <AvatarSprite spriteId={config.headwear} x={70} y={5} />
      )}

      {config.accessories?.map((accessory, index) => (
        <AvatarSprite
          key={index}
          spriteId={accessory}
          x={90}
          y={90}
        />
      ))}
    </svg>
  );
}

export function AvatarExample() {

  return (
    <div>
      
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
    '#ffba0a',
    '#ffdf8e', 
    '#ffc8b6', 
    '#f3cfb0', 
    '#bd9f94',
    '#8c5845', 
    '#652a15', 
    '#cbc9b9', 
    '#a29f89', 
    '#8c887a', 
    '#7e7c6b', 
    '#c2c2c2', 
    '#616161', 
    '#b2bceb', 
    '#3953cd',  
  ]
};

export default Avatar;