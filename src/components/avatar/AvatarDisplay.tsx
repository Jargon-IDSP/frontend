import { Avatar } from './Avatar';
import { toDataAttributeId } from './bodyViewBoxes';
import type { AvatarConfig } from '../../types/avatar';

interface AvatarDisplayProps {
  config: AvatarConfig;
  size?: number;
  className?: string;
}

/**
 * @param config
 * @param size 
 * @param className
 */
export function AvatarDisplay({ config, size = 100, className = '' }: AvatarDisplayProps) {
  const bodyId = config.expression || config.body || 'body-1';
  const shapeDataId = toDataAttributeId(bodyId, 'body');

  const hairDataId = config.hair ? toDataAttributeId(config.hair, 'hair') : undefined;

  return (
    <div
      className={`avatar-customization__canvas ${className}`.trim()}
      data-shape={shapeDataId}
      data-hair={hairDataId}
      style={{
        width: `${size}px`,
        height: `${size * 1.2}px`, 
      }}
    >
      <Avatar config={config} renderMode="layered" />
    </div>
  );
}
