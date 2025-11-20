import Mustache from "../props/Mustache";
import TopHat from "../props/TopHat";

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
      <circle cx="100" cy="100" r="80" fill={config.colors.primary} />

      <circle cx="80" cy="90" r="10" fill="#000" />
      <circle cx="120" cy="90" r="10" fill="#000" />
      
      <path d="M 70 120 Q 100 140 130 120" stroke="#000" fill="none" strokeWidth="2" />
      
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