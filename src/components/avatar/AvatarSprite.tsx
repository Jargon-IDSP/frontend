import React from 'react';

// Typescript interface for Avatars
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
}


export const AvatarSprite = React.forwardRef<SVGSVGElement, AvatarSpriteProps>(
  (
    {
      spriteId,
      className,
      viewBox = "0 0 300 300",
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

    if (x !== undefined || y !== undefined) {
      return <use href={href} x={x} y={y} />;
    }

    const svgProps: React.SVGProps<SVGSVGElement> = {
      ref,
      className,
      viewBox,
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
        <use href={href} />
      </svg>
    );
  }
);

AvatarSprite.displayName = 'AvatarSprite';

export default AvatarSprite;
