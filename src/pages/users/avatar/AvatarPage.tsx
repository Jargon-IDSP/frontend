import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import AvatarEditor from "../../../components/AvatarEditor";
import { useAvatar } from "../../../hooks/useAvatar";
import type { AvatarSelection } from "../../../config/avatarConfig";
import { composeLayers, svgToPNG, uploadAvatar } from "../../../utils/avatarComposer";

export default function AvatarPage() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { avatar, updateAvatar, loading, error } = useAvatar();
  const [isSaving, setIsSaving] = useState(false);

  // Convert backend avatar data to AvatarSelection format
  const getInitialSelection = (): AvatarSelection | undefined => {
    if (!avatar?.avatarConfig) return undefined;

    // Parse outfit to get shape ID (format: "shape-62")
    const shapeMatch = avatar.avatarConfig.outfit?.match(/shape-(\d+)/);
    const shape = shapeMatch ? parseInt(shapeMatch[1]) : 62;

    // Parse hatType to get hair ID (format: "hair-72")
    const hairMatch = avatar.avatarConfig.hatType?.match(/hair-(\d+)/);
    const hair = hairMatch ? parseInt(hairMatch[1]) : null;

    // Parse accessories array
    const accessories = avatar.avatarConfig.accessories || [];
    const getAccessoryId = (prefix: string): number | null => {
      const item = accessories.find(acc => acc.startsWith(prefix));
      if (!item) return null;
      const match = item.match(new RegExp(`${prefix}-(\\d+)`));
      return match ? parseInt(match[1]) : null;
    };

    // Get colors from avatar config (stored in colors.primary, secondary, accent)
    const colors = avatar.avatarConfig.colors;

    return {
      shape,
      shapeColor: colors?.primary || '#f3cfb0',
      hair,
      // Only load hairColor if hair is actually selected
      hairColor: hair !== null ? (colors?.secondary || null) : null,
      headwear: getAccessoryId('headwear'),
      headwearColor: null,
      uniform: getAccessoryId('uniform'),
      uniformColor: null,
      shoes: getAccessoryId('shoes'),
      shoesColor: null,
      eyewear: getAccessoryId('eyewear'),
      eyewearColor: null,
      facialHair: getAccessoryId('facialHair'),
      facialHairColor: null,
      makeup: getAccessoryId('makeup'),
      makeupColor: null,
    };
  };

  // Show error state
  if (error) {
    return (
      <div className="avatar-page-container">
        <div className="avatar-editor-modal">
          <div className="avatar-editor-content">
            <h2>Error loading avatar</h2>
            <p>{error.message}</p>
            <button onClick={() => navigate('/profile')}>Back to Profile</button>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while fetching avatar data
  if (loading) {
    return (
      <div className="avatar-page-container">
        <div className="avatar-editor-modal">
          <div className="avatar-editor-content">
            <p>Loading avatar...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async (selection: AvatarSelection) => {
    setIsSaving(true);

    try {
      // Step 1: Compose the layered SVG
      const compositeSVG = await composeLayers(selection);

      // Step 2: Convert SVG to PNG blob
      const pngBlob = await svgToPNG(compositeSVG, 400);

      // Step 3: Upload the PNG to get the image URL
      const token = await getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const imageUrl = await uploadAvatar(pngBlob, token);

      // Step 4: Convert AvatarSelection to backend format
      const accessories: string[] = [];

      if (selection.headwear !== null) accessories.push(`headwear-${selection.headwear}`);
      if (selection.uniform !== null) accessories.push(`uniform-${selection.uniform}`);
      if (selection.shoes !== null) accessories.push(`shoes-${selection.shoes}`);
      if (selection.eyewear !== null) accessories.push(`eyewear-${selection.eyewear}`);
      if (selection.facialHair !== null) accessories.push(`facialHair-${selection.facialHair}`);
      if (selection.makeup !== null) accessories.push(`makeup-${selection.makeup}`);

      // Step 5: Update avatar configuration with image URL
      updateAvatar({
        outfit: `shape-${selection.shape}`,
        hatType: selection.hair !== null ? `hair-${selection.hair}` : null,
        accessories: accessories,
        colors: {
          primary: selection.shapeColor || '#f3cfb0',
          secondary: selection.hairColor || '#a29f89',
          accent: selection.headwearColor || '#ffc8b6',
        },
        imageUrl: imageUrl, // Store the generated avatar image URL
      });

      // Navigate back after saving
      setTimeout(() => {
        navigate('/profile');
      }, 500);
    } catch (error) {
      console.error('Failed to save avatar:', error);
      alert('Failed to save avatar. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    navigate('/profile');
  };

  return (
    <div className="avatar-page-container">
      {isSaving ? (
        <div className="avatar-editor-modal">
          <div className="avatar-editor-content">
            <h2>Saving your avatar...</h2>
            <p>Please wait while we generate and upload your profile photo.</p>
          </div>
        </div>
      ) : (
        <AvatarEditor
          initialSelection={getInitialSelection()}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  );
}