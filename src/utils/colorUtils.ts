/**
 * Hair Color Palette System
 *
 * Provides multi-shade color palettes for avatar hair customization.
 * Each palette includes base, highlight, lowlight, and border colors.
 */

export interface HairColorPalette {
  base: string;      // Main fill color
  highlight: string; // Lighter fill color
  lowlight: string;  // Darker fill color (for facial hair)
  border: string;    // Stroke/outline color
}

/**
 * Pre-defined color palettes for known hair colors
 */
const HAIR_COLOR_PALETTES: Record<string, HairColorPalette> = {
  // Brown (default)
  '#512e14': {
    base: '#512e14',
    highlight: '#5b3319',
    lowlight: '#602d0b',
    border: '#2a1808'
  },

  // Black
  '#000000': {
    base: '#1a1a1a',      // Slightly lighter so highlights are visible
    highlight: '#333333',
    lowlight: '#000000',
    border: '#000000'
  },

  // Orange
  '#FF6B35': {
    base: '#FF6B35',
    highlight: '#FF8856',
    lowlight: '#E55420',
    border: '#B8421A'     // Burnt orange
  },

  // Yellow/Blonde
  '#ffba0a': {
    base: '#ffba0a',
    highlight: '#FFD147',
    lowlight: '#E0A000',
    border: '#B38600'     // Dark gold
  }
};

/**
 * Convert hex color to HSL
 * @param hex - Hex color string (e.g., "#FF6B35")
 * @returns [h, s, l] tuple where h is 0-360, s and l are 0-100
 */
export function hexToHSL(hex: string): [number, number, number] {
  // Remove # if present
  hex = hex.replace(/^#/, '');

  // Parse hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / delta + 2) / 6;
        break;
      case b:
        h = ((r - g) / delta + 4) / 6;
        break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

/**
 * Convert HSL to hex color
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param l - Lightness (0-100)
 * @returns Hex color string (e.g., "#FF6B35")
 */
export function hslToHex(h: number, s: number, l: number): string {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Adjust the lightness of a hex color
 * @param hex - Hex color string
 * @param amount - Amount to adjust (-100 to 100, where positive = lighter)
 * @returns New hex color string
 */
export function adjustLightness(hex: string, amount: number): string {
  const [h, s, l] = hexToHSL(hex);
  const newL = Math.max(0, Math.min(100, l + amount));
  return hslToHex(h, s, newL);
}

/**
 * Generate a lighter shade of a color
 * @param hex - Hex color string
 * @param amount - Amount to lighten (default: 10)
 * @returns Lighter hex color
 */
export function getLighterShade(hex: string, amount: number = 10): string {
  return adjustLightness(hex, amount);
}

/**
 * Generate a darker shade of a color
 * @param hex - Hex color string
 * @param amount - Amount to darken (default: 10)
 * @returns Darker hex color
 */
export function getDarkerShade(hex: string, amount: number = 10): string {
  return adjustLightness(hex, -amount);
}

/**
 * Generate a border color (significantly darker)
 * @param hex - Hex color string
 * @returns Border hex color
 */
export function getBorderColor(hex: string): string {
  return adjustLightness(hex, -25);
}

/**
 * Get the complete hair color palette for a given color
 * @param selectedColor - The hex color selected by the user
 * @returns HairColorPalette with base, highlight, lowlight, and border colors
 */
export function getHairColorPalette(selectedColor: string): HairColorPalette {
  // Normalize the color (uppercase, with #)
  const normalizedColor = selectedColor.toLowerCase();

  // Check if we have a pre-defined palette
  if (HAIR_COLOR_PALETTES[normalizedColor]) {
    return HAIR_COLOR_PALETTES[normalizedColor];
  }

  // For unknown colors, generate palette dynamically
  return {
    base: selectedColor,
    highlight: getLighterShade(selectedColor, 10),
    lowlight: getDarkerShade(selectedColor, 10),
    border: getBorderColor(selectedColor)
  };
}
