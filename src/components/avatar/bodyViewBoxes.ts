
// View box sizes for different heights of avatar bodies

export const BODY_VIEWBOXES: Record<string, string> = {
  'body-1': '0 0 271.07 212.6',
  'body-1-h1': '0 0 236.59 212.97',
  'body-1-h2': '0 0 253.03 212.97',
  'body-1-h3': '0 0 286.86 217.17',
  'body-1-h4': '0 0 268.02 212.97',

  'body-2': '0 0 229.07 196.83',
  'body-2-h1': '0 0 191.74 198.23',
  'body-2-h2': '0 0 208.55 198.23',
  'body-2-h3': '0 0 251.53 212.98',
  'body-2-h4': '0 0 213.72 198.23',

  'body-3': '0 0 262.07 235.16',
  'body-3-h1': '0 0 227.3 235.83',
  'body-3-h2': '0 0 235.26 235.83',
  'body-3-h3': '0 0 260.78 242.91',
  'body-3-h4': '0 0 262.8 235.83',

  'body-4': '0 0 263.07 244.69',
  'body-4-h1': '0 0 221.1 245.5',
  'body-4-h2': '0 0 228.18 245.5',
  'body-4-h3': '0 0 234.99 247.96',
  'body-4-h4': '0 0 258.71 245.5',

  'body-5': '0 0 256.07 294.91',
  'body-5-h1': '0 0 215.96 295.66',
  'body-5-h2': '0 0 222.95 295.66',
  'body-5-h3': '0 0 251.26 295.66',
  'body-5-h4': '0 0 248.47 295.66',

  'body-6': '0 0 262.07 193.62',
  'body-6-h1': '0 0 251.72 192.79',
  'body-6-h2': '0 0 254.68 192.79',
  'body-6-h3': '0 0 281.76 192.79',
  'body-6-h4': '0 0 251.72 192.79',

  'body-7': '0 0 229.07 286.22',
  'body-7-h1': '0 0 199.43 288.72',
  'body-7-h2': '0 0 208.9 288.72',
  'body-7-h3': '0 0 252.11 288.72',
  'body-7-h4': '0 0 239.48 288.72',

  'body-8': '0 0 232.07 254.34',
  'body-8-h1': '0 0 202.72 254.53',
  'body-8-h2': '0 0 208.53 254.53',
  'body-8-h3': '0 0 230.53 254.53',
  'body-8-h4': '0 0 233.16 254.53',

  'body-9': '0 0 277.07 244.03',
  'body-9-h1': '0 0 244.69 243.26',
  'body-9-h2': '0 0 259.01 243.26',
  'body-9-h3': '0 0 286.86 243.26',
  'body-9-h4': '0 0 266.51 243.26',
};


export function getBodyViewBox(spriteId: string): string {
  return BODY_VIEWBOXES[spriteId] || '0 0 300 300';
}

export function toDataAttributeId(id: string, type: 'body' | 'hair' | 'facial' | 'shoes'): string {
  if (type === 'body') {
    const match = id.match(/body-(\d+)/);
    if (match) {
      return `shape-${match[1].padStart(2, '0')}`;
    }
  } else if (type === 'hair') {
    const match = id.match(/hair-(\d+)/);
    if (match) {
      return `hair-${match[1].padStart(2, '0')}`;
    }
  } else if (type === 'facial') {
    const match = id.match(/beard-(\d+)/);
    if (match) {
      return `feature-${match[1].padStart(2, '0')}`;
    }
  } else if (type === 'shoes') {
    const match = id.match(/shoe-(\d+)/);
    if (match) {
      return `shoe-${match[1].padStart(2, '0')}`;
    }
  }
  return id;
}
