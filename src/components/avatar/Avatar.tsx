import { useEffect, useRef, useState } from 'react';
import type { AvatarProps } from '../../types/avatar';
import { AvatarSprite } from './AvatarSprite';
import { getBodyViewBox, toDataAttributeId } from './bodyViewBoxes';
import { getHairColorPalette } from '../../utils/colorUtils';


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

async function fetchSymbolWithViewBox(symbolId: string): Promise<{ content: string; viewBox: string } | null> {
  try {
    const response = await fetch('/avatar-sprites.svg');
    const svgText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const symbol = doc.getElementById(symbolId);
    if (!symbol) return null;
    return {
      content: symbol.innerHTML,
      viewBox: symbol.getAttribute('viewBox') || '0 0 300 300'
    };
  } catch (error) {
    console.error('Failed to fetch symbol:', error);
    return null;
  }
}

export function Avatar({ config, size = 100, className = '', renderMode = 'svg', onLoadingChange }: AvatarProps) {
  const bodyId = config.expression || config.body || 'body-1';
  const bodyColor = config.bodyColor || '#ffba0a';
  const hairColor = config.hairColor || '#512e14';

  if (renderMode === 'layered') {
    const hairDataId = config.hair ? toDataAttributeId(config.hair, 'hair') : undefined;
    const bodySvgRef = useRef<SVGSVGElement>(null);
    const [rawBodyContent, setRawBodyContent] = useState<string>('');
    const [bodyContent, setBodyContent] = useState<string>('');
    const [rawHairData, setRawHairData] = useState<{ content: string; viewBox: string } | null>(null);
    const [hairContent, setHairContent] = useState<string>('');
    const [hairViewBox, setHairViewBox] = useState<string>('0 0 300 300');
    const [rawFacialData, setRawFacialData] = useState<{ content: string; viewBox: string } | null>(null);
    const [facialContent, setFacialContent] = useState<string>('');
    const [facialViewBox, setFacialViewBox] = useState<string>('0 0 300 300');
    
    // Track loading states for all parts
    // Initialize based on whether parts are needed
    const [bodyLoaded, setBodyLoaded] = useState(false);
    const [hairLoaded, setHairLoaded] = useState(!config.hair); // No hair means already "loaded"
    const [facialLoaded, setFacialLoaded] = useState(!config.facial); // No facial means already "loaded"
    const [spritesLoaded, setSpritesLoaded] = useState(!(config.shoes || config.clothing || config.eyewear || config.headwear || config.accessories)); // No sprites means already "loaded"

    // Report initial loading state
    useEffect(() => {
      if (!bodyContent) {
        onLoadingChange?.(true);
      }
    }, []);

    useEffect(() => {
      let mounted = true;

      setBodyLoaded(false);
      fetchSymbolContent(bodyId)
        .then(content => {
          if (content && mounted) {
            setRawBodyContent(content);
            setBodyLoaded(true);
          } else if (mounted) {
            setBodyLoaded(true);
          }
        })
        .catch(() => {
          if (mounted) setBodyLoaded(true);
        });

      return () => { mounted = false; };
    }, [bodyId]);

    useEffect(() => {
      if (!rawBodyContent) return;

      const BODY_COLOR_CLASSES = [
        'st17', 'st18', 'st19', 'st20', 'st21', 'st22', 'st23', 'st24',
        'st25', 'st26', 'st27', 'st30', 'st31', 'st32', 'st33', 'st34', 'st49'
      ];

      let coloredContent = rawBodyContent;
      BODY_COLOR_CLASSES.forEach(className => {
        const regex = new RegExp(`class="${className}"`, 'g');
        coloredContent = coloredContent.replace(
          regex,
          `class="${className}" fill="${bodyColor}"`
        );
      });

      setBodyContent(coloredContent);
    }, [bodyColor, rawBodyContent]);

    useEffect(() => {
      if (!config.hair) {
        setRawHairData(null);
        setHairLoaded(true); // No hair means it's "loaded"
        return;
      }

      setHairLoaded(false);
      let mounted = true;
      fetchSymbolWithViewBox(config.hair)
        .then(data => {
          if (data && mounted) {
            setRawHairData(data);
            setHairViewBox(data.viewBox);
            setHairLoaded(true);
          } else if (mounted) {
            setHairLoaded(true);
          }
        })
        .catch(() => {
          if (mounted) {
            setRawHairData(null);
            setHairLoaded(true);
          }
        });

      return () => { mounted = false; };
    }, [config.hair]);

    useEffect(() => {
      if (!rawHairData) {
        setHairContent('');
        return;
      }

      const palette = getHairColorPalette(hairColor);
      let coloredContent = rawHairData.content;

      // Map original SVG colors to palette shades
      const colorMappings = {
        '#512e14': palette.base,
        '#5b3319': palette.highlight
      };

      // Replace fill colors
      Object.entries(colorMappings).forEach(([original, replacement]) => {
        const regex = new RegExp(`fill="${original}"`, 'g');
        coloredContent = coloredContent.replace(regex, `fill="${replacement}"`);
      });

      setHairContent(coloredContent);
    }, [hairColor, rawHairData]);

    useEffect(() => {
      if (!config.facial) {
        setRawFacialData(null);
        setFacialLoaded(true); // No facial means it's "loaded"
        return;
      }

      setFacialLoaded(false);
      let mounted = true;
      fetchSymbolWithViewBox(config.facial)
        .then(data => {
          if (data && mounted) {
            setRawFacialData(data);
            setFacialViewBox(data.viewBox);
            setFacialLoaded(true);
          } else if (mounted) {
            setFacialLoaded(true);
          }
        })
        .catch(() => {
          if (mounted) {
            setRawFacialData(null);
            setFacialLoaded(true);
          }
        });

      return () => { mounted = false; };
    }, [config.facial]);

    useEffect(() => {
      if (!rawFacialData) {
        setFacialContent('');
        return;
      }

      const palette = getHairColorPalette(hairColor);
      let coloredContent = rawFacialData.content;

      // Map original SVG colors to palette shades (facial hair uses base color for all shades)
      const colorMappings = {
        '#512e14': palette.base,
        '#5b3319': palette.highlight,
        '#602d0b': palette.base  // Use base color instead of lowlight
      };

      // Replace fill colors
      Object.entries(colorMappings).forEach(([original, replacement]) => {
        const regex = new RegExp(`fill="${original}"`, 'g');
        coloredContent = coloredContent.replace(regex, `fill="${replacement}"`);
      });

      setFacialContent(coloredContent);
    }, [hairColor, rawFacialData]);

    // Wait for SVG sprites to load (shoes, clothing, eyewear, headwear, accessories)
    // Since sprites use <use> elements referencing the same SVG file as body, once body is loaded,
    // the SVG file should be available. We just need to wait for DOM to render the sprite elements.
    useEffect(() => {
      // Check if any sprites are needed
      const hasSprites = !!(config.shoes || config.clothing || config.eyewear || config.headwear || config.accessories);
      
      if (!hasSprites) {
        setSpritesLoaded(true);
        return;
      }

      // Reset loading state when sprites are needed
      setSpritesLoaded(false);

      // Once body is loaded, the SVG file is available. Wait for sprite elements to render.
      // We'll mark sprites as loaded after body is loaded and a short delay for rendering
      if (bodyLoaded) {
        const timeout = setTimeout(() => {
          setSpritesLoaded(true);
        }, 150); // Small delay to allow <use> elements to render
        return () => clearTimeout(timeout);
      }
    }, [bodyLoaded, config.shoes, config.clothing, config.eyewear, config.headwear, config.accessories]);

    // Report loading state when all parts are ready
    useEffect(() => {
      const allPartsLoaded = bodyLoaded && hairLoaded && facialLoaded && spritesLoaded && bodyContent;
      if (allPartsLoaded) {
        onLoadingChange?.(false);
      } else if (bodyContent) {
        // Still loading other parts
        onLoadingChange?.(true);
      }
    }, [bodyLoaded, hairLoaded, facialLoaded, spritesLoaded, bodyContent, onLoadingChange]);

    if (!bodyContent) {
      return null;
    }

    return (
      <div className="AvatarSprite">
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

        {config.hair && hairContent && (
          <svg
            className="avatar-layer avatar-layer--hair"
            viewBox={hairViewBox}
            dangerouslySetInnerHTML={{ __html: hairContent }}
            data-hair={hairDataId}
          />
        )}

        {config.facial && facialContent && (
          <svg
            className="avatar-layer avatar-layer--feature"
            viewBox={facialViewBox}
            dangerouslySetInnerHTML={{ __html: facialContent }}
            data-facial={toDataAttributeId(config.facial, 'facial')}
          />
        )}

        {config.eyewear && (
          <AvatarSprite
            spriteId={config.eyewear}
            className="avatar-layer avatar-layer--eyewear"
            dataAttributes={{ 'data-eyewear': config.eyewear }}
          />
        )}

        {config.headwear && (
          <AvatarSprite
            spriteId={config.headwear}
            className="avatar-layer avatar-layer--headwear"
            dataAttributes={{ 'data-headwear': config.headwear }}
          />
        )}

        {config.accessories && (
          <AvatarSprite
            spriteId={config.accessories}
            className="avatar-layer avatar-layer--accessories"
            dataAttributes={{ 'data-accessories': config.accessories }}
          />
        )}

        {config.clothing && (
          <AvatarSprite
            spriteId={config.clothing}
            className="avatar-layer avatar-layer--clothing"
            dataAttributes={{ 'data-clothing': config.clothing }}
          />
        )}
      </div>
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
        xlinkHref={`/avatar-sprites.svg#${bodyId}`}
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
        <AvatarSprite spriteId={config.hair} x={90} y={30} style={{ fill: hairColor }} />
      )}

      {config.facial && (
        <AvatarSprite spriteId={config.facial} x={105} y={120} style={{ fill: hairColor }} />
      )}

      {config.eyewear && (
        <AvatarSprite spriteId={config.eyewear} x={80} y={85} />
      )}

      {config.headwear && (
        <AvatarSprite spriteId={config.headwear} x={70} y={5} />
      )}

      {config.accessories && (
        <AvatarSprite spriteId={config.accessories} x={90} y={90} />
      )}
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
  headwear: ['cap', 'hard-hat', 'round-hat', 'round-hat-2', 'round-hat-3', 'orange-mask', 'orange-mask-2'],
  eyewear: ['glasses', 'welding-mask', 'goggles'],
  facial: ['beard-1', 'beard-2', 'beard-3'],
  clothing: ['yellow-vest', 'orange-vest', 'name-tag'],
  shoes: ['shoe-1', 'shoe-2', 'shoe-3'],
  accessories: ['beauty-spot', 'blush', 'lashes-1'],
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
  ],
  hairColors: [
    '#512e14',
    '#000000',
    '#FF6B35',
    '#ffba0a'
  ]
};

export default Avatar;