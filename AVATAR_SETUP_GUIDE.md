# Avatar System Setup Guide

## Current Status ✅
- Avatar editor UI is complete and working
- Backend API endpoints are set up
- Database schema is ready
- User selections are saved correctly

## What's Working
- ✅ 3 tabs (Shape, Hair, Features)
- ✅ Grid layout with selection highlighting
- ✅ Save functionality
- ✅ Navigation between profile and avatar editor
- ✅ Data persistence in database

## What's Missing: Avatar Images

Currently using emoji placeholders. To add real avatar images:

### 1. Prepare Avatar Assets

From your reference sheets, you need to extract individual images for:

**Body Shapes** (9 variations)
- Save as: `public/avatars/shapes/shape-0.png` through `shape-8.png`

**Hair Styles** (7 variations)
- Save as: `public/avatars/hair/hair-0.png` through `hair-6.png`

**Headwear** (8 variations)
- Save as: `public/avatars/headwear/headwear-0.png` through `headwear-7.png`

**Uniforms** (3 variations)
- Save as: `public/avatars/uniforms/uniform-0.png` through `uniform-2.png`

**Shoes** (3 variations)
- Save as: `public/avatars/shoes/shoes-0.png` through `shoes-2.png`

**Eyewear** (2 variations)
- Save as: `public/avatars/eyewear/eyewear-0.png` through `eyewear-1.png`

**Facial Hair** (3 variations)
- Save as: `public/avatars/facialHair/facialHair-0.png` through `facialHair-2.png`

**Makeup** (6 variations)
- Save as: `public/avatars/makeup/makeup-0.png` through `makeup-5.png`

### 2. Update AvatarEditor Component

Replace the emoji placeholders in `src/components/AvatarEditor.tsx`:

```tsx
// BEFORE (emoji placeholder):
<span className="shape-emoji">⬤</span>

// AFTER (actual image):
<img src={`/avatars/shapes/shape-${shape.id}.png`} alt={shape.name} />
```

### 3. Build Avatar Preview

Create a component that layers the selected parts to show the complete avatar:

```tsx
// In src/components/AvatarPreview.tsx
export function AvatarPreview({ selection }: { selection: AvatarSelection }) {
  return (
    <div className="avatar-preview-container">
      <img src={`/avatars/shapes/shape-${selection.shape}.png`} className="avatar-base" />
      {selection.hair && <img src={`/avatars/hair/hair-${selection.hair}.png`} className="avatar-layer" />}
      {selection.headwear && <img src={`/avatars/headwear/headwear-${selection.headwear}.png`} className="avatar-layer" />}
      {/* Add other layers */}
    </div>
  );
}
```

## File Structure

```
frontend/
├── public/
│   └── avatars/
│       ├── shapes/
│       │   ├── shape-0.png
│       │   ├── shape-1.png
│       │   └── ...
│       ├── hair/
│       │   ├── hair-0.png
│       │   └── ...
│       ├── headwear/
│       ├── uniforms/
│       ├── shoes/
│       ├── eyewear/
│       ├── facialHair/
│       └── makeup/
└── src/
    ├── components/
    │   ├── AvatarEditor.tsx ✅ (Done)
    │   └── AvatarPreview.tsx (To create)
    ├── config/
    │   └── avatarConfig.ts ✅ (Done)
    └── hooks/
        └── useAvatar.ts ✅ (Done)
```

## Alternative: Use Reference Sheets Temporarily

If you want to show the reference sheets as-is while waiting for individual assets:

1. Copy the reference PNGs to `public/avatars/reference/`
2. Display them as visual guides in the editor
3. Keep the current emoji placeholders for selection

## Testing Checklist

Once images are added:
- [ ] All 9 body shapes display correctly
- [ ] Hair options show in grid
- [ ] Features display in their categories
- [ ] Selected options are highlighted
- [ ] Avatar preview shows combined result
- [ ] Save button persists selections
- [ ] Profile page shows user's avatar

## Next Steps

1. Extract individual avatar parts from reference sheets (use Photoshop, Figma, etc.)
2. Save as PNGs with transparent backgrounds
3. Upload to `public/avatars/` folders
4. Update AvatarEditor to use images instead of emojis
5. Create AvatarPreview component for profile page

Your avatar system is fully functional - it just needs the actual image assets to be complete!
