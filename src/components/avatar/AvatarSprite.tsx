import React from 'react';
import { getBodyViewBox } from './bodyViewBoxes';
import { getAccessoryViewBox } from './accessoryViewBoxes';
import type { AvatarSpriteProps } from '../../types/avatar';


export const AvatarSprite = React.forwardRef<SVGSVGElement, AvatarSpriteProps>(
  (
    {
      spriteId,
      className,
      viewBox,
      size,
      width,
      height,
      style,
      dataAttributes,
      x,
      y,
      spritePath = "/avatar-sprites.svg",
    },
    ref
  ) => {
    const href = `${spritePath}#${spriteId}`;

    const resolvedViewBox = viewBox ||
      (getBodyViewBox(spriteId) !== '0 0 300 300'
        ? getBodyViewBox(spriteId)
        : getAccessoryViewBox(spriteId));

    if (x !== undefined || y !== undefined) {
      return <use href={href} xlinkHref={href} x={x} y={y} />;
    }

    const svgProps: React.SVGProps<SVGSVGElement> = {
      ref,
      className,
      viewBox: resolvedViewBox,
      style,
      ...dataAttributes,
    };

    if (size !== undefined) {
      svgProps.width = size;
      svgProps.height = size;
    }
    if (width !== undefined) {
      svgProps.width = width;
    }
    if (height !== undefined) {
      svgProps.height = height;
    }

    return (
      <svg {...svgProps}>
        <use href={href} xlinkHref={href} />
      </svg>
    );
  }
);

AvatarSprite.displayName = 'AvatarSprite';

export default AvatarSprite;
