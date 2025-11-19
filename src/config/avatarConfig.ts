// Avatar customization options based on asset reference sheets
// The indices correspond to the order shown in the reference images

export interface AvatarSelection {
  shape: number;
  shapeColor: string | null;
  hair: number | null;
  hairColor: string | null;
  headwear: number | null;
  headwearColor: string | null;
  uniform: number | null;
  uniformColor: string | null;
  shoes: number | null;
  shoesColor: string | null;
  eyewear: number | null;
  eyewearColor: string | null;
  facialHair: number | null;
  facialHairColor: string | null;
  makeup: number | null;
  makeupColor: string | null;
}

// Body shapes from "Different shaped characters" sheet (9 variations)
// Asset files: 62-70
export const SHAPES = [
  { id: 62, name: 'Shape 1', file: 'Asset 62.svg' },
  { id: 63, name: 'Shape 2', file: 'Asset 63.svg' },
  { id: 64, name: 'Shape 3', file: 'Asset 64.svg' },
  { id: 65, name: 'Shape 4', file: 'Asset 65.svg' },
  { id: 66, name: 'Shape 5', file: 'Asset 66.svg' },
  { id: 67, name: 'Shape 6', file: 'Asset 67.svg' },
  { id: 68, name: 'Shape 7', file: 'Asset 68.svg' },
  { id: 69, name: 'Shape 8', file: 'Asset 69.svg' },
  { id: 70, name: 'Shape 9', file: 'Asset 70.svg' },
];

// Hairstyles from "Hair and makeup" sheet
// Asset files: 72-78
export const HAIR = [
  { id: 72, name: 'Hair Style 1', file: 'Asset 72.svg' },
  { id: 73, name: 'Hair Style 2', file: 'Asset 73.svg' },
  { id: 74, name: 'Hair Style 3', file: 'Asset 74.svg' },
  { id: 75, name: 'Hair Style 4', file: 'Asset 75.svg' },
  { id: 76, name: 'Hair Style 5', file: 'Asset 76.svg' },
  { id: 77, name: 'Hair Style 6', file: 'Asset 77.svg' },
  { id: 78, name: 'Hair Style 7', file: 'Asset 78.svg' },
];

// Headwear from "Accessories" sheet
// Asset files: 89-97
export const HEADWEAR = [
  { id: 89, name: 'Headwear 1', file: 'Asset 89.svg' },
  { id: 90, name: 'Headwear 2', file: 'Asset 90.svg' },
  { id: 91, name: 'Headwear 3', file: 'Asset 91.svg' },
  { id: 92, name: 'Headwear 4', file: 'Asset 92.svg' },
  { id: 93, name: 'Headwear 5', file: 'Asset 93.svg' },
  { id: 94, name: 'Headwear 6', file: 'Asset 94.svg' },
  { id: 95, name: 'Headwear 7', file: 'Asset 95.svg' },
  { id: 96, name: 'Headwear 8', file: 'Asset 96.svg' },
  { id: 97, name: 'Headwear 9', file: 'Asset 97.svg' },
];

// Uniforms from "Accessories" sheet
// Asset files: 98-100
export const UNIFORMS = [
  { id: 98, name: 'Uniform 1', file: 'Asset 98.svg' },
  { id: 99, name: 'Uniform 2', file: 'Asset 99.svg' },
  { id: 100, name: 'Uniform 3', file: 'Asset 100.svg' },
];

// Shoes from "Accessories" sheet
// Asset files: 101-103
export const SHOES = [
  { id: 101, name: 'Shoes 1', file: 'Asset 101.svg' },
  { id: 102, name: 'Shoes 2', file: 'Asset 102.svg' },
  { id: 103, name: 'Shoes 3', file: 'Asset 103.svg' },
];

// Eyewear from "Accessories" sheet
// Asset files: 104-105
export const EYEWEAR = [
  { id: 104, name: 'Eyewear 1', file: 'Asset 104.svg' },
  { id: 105, name: 'Eyewear 2', file: 'Asset 105.svg' },
];

// Facial Hair from "Hair and makeup" sheet
// Asset files: 79-81
export const FACIAL_HAIR = [
  { id: 79, name: 'Facial Hair 1', file: 'Asset 79.svg' },
  { id: 80, name: 'Facial Hair 2', file: 'Asset 80.svg' },
  { id: 81, name: 'Facial Hair 3', file: 'Asset 81.svg' },
];

// Makeup from "Hair and makeup" sheet
// Asset files: 82-88
export const MAKEUP = [
  { id: 82, name: 'Makeup 1', file: 'Asset 82.svg' },
  { id: 83, name: 'Makeup 2', file: 'Asset 83.svg' },
  { id: 84, name: 'Makeup 3', file: 'Asset 84.svg' },
  { id: 85, name: 'Makeup 4', file: 'Asset 85.svg' },
  { id: 86, name: 'Makeup 5', file: 'Asset 86.svg' },
  { id: 87, name: 'Makeup 6', file: 'Asset 87.svg' },
  { id: 88, name: 'Makeup 7', file: 'Asset 88.svg' },
];

// Available colors from Assets 106-121
export const COLORS = [
  { id: 106, name: 'Beige', hex: '#f3cfb0' },
  { id: 107, name: 'Light Gray', hex: '#cbc9b9' },
  { id: 108, name: 'Olive', hex: '#a29f89' },
  { id: 109, name: 'Dark Olive', hex: '#7e7c6b' },
  { id: 110, name: 'Peach', hex: '#ffc8b6' },
  { id: 111, name: 'Light Brown', hex: '#f3ad9c' },
  { id: 112, name: 'Tan', hex: '#c3906a' },
  { id: 113, name: 'Medium Brown', hex: '#a97249' },
  { id: 114, name: 'Orange', hex: '#ff9259' },
  { id: 115, name: 'Red Orange', hex: '#ec7b4f' },
  { id: 116, name: 'Burnt Orange', hex: '#ca5a2e' },
  { id: 117, name: 'Dark Red', hex: '#994324' },
  { id: 118, name: 'Yellow', hex: '#ffc045' },
  { id: 119, name: 'Orange Yellow', hex: '#f8a63f' },
  { id: 120, name: 'Gold', hex: '#db8429' },
  { id: 121, name: 'Brown', hex: '#aa6118' },
];

export const DEFAULT_AVATAR: AvatarSelection = {
  shape: 62,
  shapeColor: '#f3cfb0',
  hair: null,
  hairColor: null,
  headwear: null,
  headwearColor: null,
  uniform: null,
  uniformColor: null,
  shoes: null,
  shoesColor: null,
  eyewear: null,
  eyewearColor: null,
  facialHair: null,
  facialHairColor: null,
  makeup: null,
  makeupColor: null,
};
