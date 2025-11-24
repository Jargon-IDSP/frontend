const fs = require('fs');
const path = require('path');

const BODY_COLOR_CLASSES = new Set([
  'st17', 'st18', 'st19', 'st20', 'st21', 'st22', 'st23', 'st24',
  'st25', 'st26', 'st27', 'st30', 'st31', 'st32', 'st33', 'st34', 'st49'
]);

function processAvatarSprites() {
  const svgPath = path.join(__dirname, '../public/avatar-sprites.svg');
  const svgContent = fs.readFileSync(svgPath, 'utf-8');

  // Extract color mappings
  const colorMap = new Map();

  // First, find all style rules with fill properties
  const styleBlockRegex = /<style>([\s\S]*?)<\/style>/;
  const styleMatch = svgContent.match(styleBlockRegex);

  if (styleMatch) {
    const styleContent = styleMatch[1];
    // Match rules with fill, handling both single and comma-separated selectors
    const ruleRegex = /([^{}]+)\s*\{([^}]*?fill:\s*([^;]+);[^}]*)\}/g;
    let match;

    while ((match = ruleRegex.exec(styleContent)) !== null) {
      const selectors = match[1].split(',').map(s => s.trim());
      const color = match[3].trim();

      selectors.forEach(selector => {
        // Extract class name from selector like ".st9" or ".st10"
        const classMatch = selector.match(/\.st(\d+)/);
        if (classMatch) {
          const className = `st${classMatch[1]}`;
          colorMap.set(className, color);
        }
      });
    }
  }

  console.log(`Found ${colorMap.size} color classes in SVG`);

  // Replace non-body classes with inline fills
  let processedContent = svgContent;
  let replacementCount = 0;

  colorMap.forEach((color, className) => {
    if (!BODY_COLOR_CLASSES.has(className)) {
      // Match class="stX" and replace with inline fill attribute
      const classRegex = new RegExp(`class="${className}"`, 'g');
      const matches = (svgContent.match(classRegex) || []).length;

      if (matches > 0) {
        processedContent = processedContent.replace(classRegex, `fill="${color}"`);
        replacementCount += matches;
      }
    }
  });

  // Ensure the root SVG has display: none to prevent sprite sheet from showing
  if (!processedContent.includes('style="display: none;"')) {
    processedContent = processedContent.replace(
      /<svg([^>]*?)>/,
      '<svg$1 style="display: none;">'
    );
    console.log('📝 Added display: none to root SVG element');
  }

  // Create backup
  const backupPath = path.join(__dirname, '../public/avatar-sprites.backup.svg');
  fs.writeFileSync(backupPath, svgContent);

  // Write processed version
  fs.writeFileSync(svgPath, processedContent);

  console.log('✅ Avatar sprites processed successfully');
  console.log(`📦 Created backup at: avatar-sprites.backup.svg`);
  console.log(`📊 Converted ${colorMap.size - BODY_COLOR_CLASSES.size} color classes to inline fills`);
  console.log(`🔄 Made ${replacementCount} replacements in the SVG`);
  console.log(`🎨 Preserved ${BODY_COLOR_CLASSES.size} body color classes for dynamic coloring`);
}

try {
  processAvatarSprites();
} catch (error) {
  console.error('❌ Error processing avatar sprites:', error.message);
  process.exit(1);
}
