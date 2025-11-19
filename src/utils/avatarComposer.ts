import type { AvatarSelection } from '../config/avatarConfig';

/**
 * Loads an SVG file and returns its content as a string
 */
async function loadSVG(path: string): Promise<string> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load SVG: ${path}`);
  }
  return response.text();
}

/**
 * Extracts the inner content of an SVG (everything between <svg> tags)
 * and optionally applies a color using DOM manipulation for complete isolation
 */
function extractSVGContent(svgString: string, color?: string | null): { content: string; viewBox: string } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgElement = doc.querySelector('svg');

  if (!svgElement) {
    throw new Error('Invalid SVG');
  }

  const viewBox = svgElement.getAttribute('viewBox') || '0 0 200 200';

  // Clone the SVG element to avoid modifying the original
  const clonedSvg = svgElement.cloneNode(true) as SVGElement;

  // Extract CSS rules from style tags to understand what colors are used
  const cssColorMap = new Map<string, string>();
  const styleTags = clonedSvg.querySelectorAll('style');

  styleTags.forEach((styleTag) => {
    const cssText = styleTag.textContent || '';
    // Parse CSS rules like ".cls-1 { fill: #ffba0a; }"
    const cssRules = cssText.matchAll(/\.([\w-]+)\s*\{[^}]*fill\s*:\s*([^;}\s]+)/gi);

    for (const match of cssRules) {
      const className = match[1];
      const fillColor = match[2].trim();
      cssColorMap.set(className, fillColor);
    }
  });

  // If no color is provided, remove style tags and apply original colors inline
  if (!color) {
    // Remove style tags
    styleTags.forEach(tag => tag.remove());

    // Apply original CSS colors as inline fill attributes
    const allElements = clonedSvg.querySelectorAll('*');
    allElements.forEach((element) => {
      // Check if element has a class that maps to a fill color
      const classList = element.getAttribute('class')?.split(' ') || [];
      for (const className of classList) {
        if (cssColorMap.has(className)) {
          const fillColor = cssColorMap.get(className)!;
          element.setAttribute('fill', fillColor);
          element.removeAttribute('class'); // Remove class after applying inline style
          break;
        }
      }
    });

    return { content: clonedSvg.innerHTML, viewBox };
  }

  // Remove all style tags to prevent CSS conflicts
  styleTags.forEach(tag => tag.remove());

  // Apply the new color to all elements
  const allElements = clonedSvg.querySelectorAll('*');
  allElements.forEach((element) => {
    // Check if element has a class that should get the new color
    const classList = element.getAttribute('class')?.split(' ') || [];
    let shouldColor = false;

    for (const className of classList) {
      if (cssColorMap.has(className)) {
        const originalColor = cssColorMap.get(className)!;
        // Only apply new color if original wasn't black
        if (!originalColor.match(/^#0{6}$/i) &&
            !originalColor.match(/^#0{2,3}$/i) &&
            !originalColor.match(/^black$/i) &&
            !originalColor.match(/^none$/i)) {
          shouldColor = true;
          break;
        }
      }
    }

    if (shouldColor) {
      element.setAttribute('fill', color);
      element.removeAttribute('class'); // Remove class after applying inline style
    } else if (classList.length > 0) {
      // Even if we're not coloring, apply the original color from CSS
      for (const className of classList) {
        if (cssColorMap.has(className)) {
          element.setAttribute('fill', cssColorMap.get(className)!);
          element.removeAttribute('class');
          break;
        }
      }
    }

    // Also handle existing inline fill attributes
    if (element.hasAttribute('fill')) {
      const currentFill = element.getAttribute('fill');
      // Only replace if it's NOT black, near-black, or none
      if (currentFill &&
          !currentFill.match(/^#0{6}$/i) &&
          !currentFill.match(/^#0{2,3}$/i) &&
          !currentFill.match(/^black$/i) &&
          !currentFill.match(/^none$/i)) {
        element.setAttribute('fill', color);
      }
    }
  });

  return { content: clonedSvg.innerHTML, viewBox };
}

/**
 * Composes multiple SVG layers into a single SVG with proper positioning
 */
export async function composeLayers(selection: AvatarSelection): Promise<string> {
  const layers: string[] = [];
  const viewBox = '0 0 400 400'; // Standard canvas size

  try {
    // Layer 1: Base shape (required) - centered, full body
    const shapePath = `/avatars/shapes/Asset ${selection.shape}.svg`;
    const shapeSVG = await loadSVG(shapePath);
    const shapeData = extractSVGContent(shapeSVG, selection.shapeColor);
    // Center the shape: translate to middle
    layers.push(`<g id="shape" transform="translate(100, 60) scale(1.0)">${shapeData.content}</g>`);

    // Layer 2: Shoes (at feet, bottom of body)
    if (selection.shoes !== null) {
      const shoesPath = `/avatars/shoes/Asset ${selection.shoes}.svg`;
      const shoesSVG = await loadSVG(shoesPath);
      const shoesData = extractSVGContent(shoesSVG, selection.shoesColor);
      layers.push(`<g id="shoes" transform="translate(100, 360) scale(0.85)">${shoesData.content}</g>`);
    }

    // Layer 3: Uniform (on body, middle)
    if (selection.uniform !== null) {
      const uniformPath = `/avatars/uniform/Asset ${selection.uniform}.svg`;
      const uniformSVG = await loadSVG(uniformPath);
      const uniformData = extractSVGContent(uniformSVG, selection.uniformColor);
      layers.push(`<g id="uniform" transform="translate(100, 170) scale(1.0)">${uniformData.content}</g>`);
    }

    // Layer 4: Facial Hair (above mouth area)
    if (selection.facialHair !== null) {
      const facialHairPath = `/avatars/facial-hair/Asset ${selection.facialHair}.svg`;
      const facialHairSVG = await loadSVG(facialHairPath);
      const facialHairData = extractSVGContent(facialHairSVG, selection.facialHairColor);
      layers.push(`<g id="facial-hair" transform="translate(100, 220) scale(0.55)">${facialHairData.content}</g>`);
    }

    // Layer 5: Makeup (on face)
    if (selection.makeup !== null) {
      const makeupPath = `/avatars/makeup/Asset ${selection.makeup}.svg`;
      const makeupSVG = await loadSVG(makeupPath);
      const makeupData = extractSVGContent(makeupSVG, selection.makeupColor);
      layers.push(`<g id="makeup" transform="translate(100, 190) scale(0.7)">${makeupData.content}</g>`);
    }

    // Layer 6: Eyewear (on eyes/face)
    if (selection.eyewear !== null) {
      const eyewearPath = `/avatars/eyewear/Asset ${selection.eyewear}.svg`;
      const eyewearSVG = await loadSVG(eyewearPath);
      const eyewearData = extractSVGContent(eyewearSVG, selection.eyewearColor);
      layers.push(`<g id="eyewear" transform="translate(100, 180) scale(0.7)">${eyewearData.content}</g>`);
    }

    // Layer 7: Hair (on top of head)
    if (selection.hair !== null) {
      const hairPath = `/avatars/hair/Asset ${selection.hair}.svg`;
      const hairSVG = await loadSVG(hairPath);
      const hairData = extractSVGContent(hairSVG, selection.hairColor);
      layers.push(`<g id="hair" transform="translate(90, 50) scale(0.85)">${hairData.content}</g>`);
    }

    // Layer 8: Headwear (on top of hair, highest layer)
    if (selection.headwear !== null) {
      const headwearPath = `/avatars/headwear/Asset ${selection.headwear}.svg`;
      const headwearSVG = await loadSVG(headwearPath);
      const headwearData = extractSVGContent(headwearSVG, selection.headwearColor);
      layers.push(`<g id="headwear" transform="translate(90, 30) scale(0.85)">${headwearData.content}</g>`);
    }

    // Compose final SVG
    const compositeSVG = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="400" height="400">
        ${layers.join('\n')}
      </svg>
    `.trim();

    return compositeSVG;
  } catch (error) {
    console.error('Error composing avatar layers:', error);
    throw error;
  }
}

/**
 * Converts SVG string to a data URL
 */
export function svgToDataURL(svgString: string): string {
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  return URL.createObjectURL(blob);
}

/**
 * Converts SVG to PNG blob for upload
 */
export async function svgToPNG(svgString: string, size: number = 400): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      }, 'image/png');
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG image'));
    };

    img.src = url;
  });
}

/**
 * Uploads the avatar image to the backend
 */
export async function uploadAvatar(blob: Blob, token: string): Promise<string> {
  const formData = new FormData();
  formData.append('avatar', blob, 'avatar.png');

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080';
  const response = await fetch(`${BACKEND_URL}/profile/avatar/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload avatar');
  }

  const data = await response.json();
  return data.imageUrl;
}
