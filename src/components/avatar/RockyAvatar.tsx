import Mustache from "./Mustache";
import TopHat from "./TopHat";

interface RockyAvatarProps {
  config: {
    outfit: string;
    accessories: string[];
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
}

export default function RockyAvatar({ config }: RockyAvatarProps) {
  return (
    <svg width="200" height="200" viewBox="0 0 200 200">
      {/* Base body */}
      <circle cx="100" cy="100" r="80" fill={config.colors.primary} />

      {/* Eyes */}
      <circle cx="80" cy="90" r="10" fill="#000" />
      <circle cx="120" cy="90" r="10" fill="#000" />
      
      {/* Smile */}
      <path d="M 70 120 Q 100 140 130 120" stroke="#000" fill="none" strokeWidth="2" />
      
      {/* Outfit - Space Suit */}
      {config.outfit === "space_suit" && (
        <g>
          <rect x="60" y="140" width="80" height="40" fill={config.colors.secondary} />
          <circle cx="100" cy="160" r="5" fill={config.colors.accent} />
        </g>
      )}
      
      {/* Accessories */}
      {config.accessories.includes("tophat") && <TopHat />}
      {config.accessories.includes("mustache") && <Mustache />}
      
      {config.accessories.includes("glasses") && (
        <g>
          <circle cx="80" cy="90" r="15" fill="none" stroke="#000" strokeWidth="2" />
          <circle cx="120" cy="90" r="15" fill="none" stroke="#000" strokeWidth="2" />
          <line x1="95" y1="90" x2="105" y2="90" stroke="#000" strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}