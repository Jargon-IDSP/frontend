import { Avatar } from './Avatar';
import { toDataAttributeId } from './bodyViewBoxes';
import type { AvatarDisplayProps } from '../../types/avatar';

export function AvatarDisplay({ config, size = 100, className = '' }: AvatarDisplayProps) {
  const bodyId = config.expression || config.body || 'body-1';
  const shapeDataId = toDataAttributeId(bodyId, 'body');
  const hairDataId = config.hair ? toDataAttributeId(config.hair, 'hair') : undefined;
  const headwearDataId = config.headwear || undefined;

  const BASE_WIDTH = 210;
  const BASE_HEIGHT = 250;

  const scaleFactor = size / BASE_WIDTH;

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size * (BASE_HEIGHT / BASE_WIDTH)}px`,
        position: 'relative',
      }}
    >
      <div
        className={`avatar-customization__canvas ${className}`.trim()}
        data-shape={shapeDataId}
        data-hair={hairDataId}
        data-headwear={headwearDataId}
        style={{
          width: `${BASE_WIDTH}px`,
          height: `${BASE_HEIGHT}px`,
          transform: `scale(${scaleFactor})`,
          transformOrigin: 'top left',
        }}
      >
        <Avatar config={config} renderMode="layered" />
      </div>
    </div>
  );
}
