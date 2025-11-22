
// ViewBox sizes for avatar accessories

export const ACCESSORY_VIEWBOXES: Record<string, string> = {
  // Hair
  'hair-1': '0 0 270.75 158.75',
  'hair-2': '0 0 155.04 115.14',
  'hair-3': '0 0 92.94 50.75',
  'hair-4': '0 0 240.32 151.13',
  'hair-5': '0 0 90.5 49',
  'hair-6': '0 0 82.96 81.1',
  'hair-7': '0 0 232.17 157.82',

  // Shoes
  'shoe-1': '0 0 124.7 42.11',
  'shoe-2': '0 0 128.91 43.55',
  'shoe-3': '0 0 125.32 37.43',

  // Clothing
  'orange-vest': '0 0 130.53 66.41',
  'yellow-vest': '0 0 131.56 66.41',

  // Headwear
  'cap': '0 0 132.7 81.15',
  'hard-hat': '0 0 130.06 95.6',
  'round-hat': '0 0 176.62 109.47',
  'round-hat-2': '0 0 167.36 116.66',

  // Eyewear
  'glasses': '0 0 94.58 32.5',
  'orange-mask': '0 0 150.86 170.43',
  'welding-mask': '0 0 162.38 172.07',

  // Facial hair
  'beard-1': '0 0 107.61 102.95',
  'beard-2': '0 0 44.35 50.07',
  'beard-3': '0 0 94.61 25.31',

  // Small accessories
  'name-tag': '0 0 113.65 54.15',
  'beauty-spot': '0 0 6.24 5',
  'blush': '0 0 268 156',
  'lashes-1': '0 0 69.34 26.34',
  'lashes-2': '0 0 69.34 40.64',
};

export function getAccessoryViewBox(spriteId: string): string {
  return ACCESSORY_VIEWBOXES[spriteId] || '0 0 300 300';
}
