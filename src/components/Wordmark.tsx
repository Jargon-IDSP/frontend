interface JargonLogoProps {
  size?: string;
  rounded?: boolean;
  className?: string;
}

export default function JargonLogo({ 
  size = '20rem', 
  rounded = true,
  className = 'jargonLogo'
}: JargonLogoProps) {
  return (
    <img 
      src="/Jargon_Wordmark.png" 
      alt="Jargon Word Mark" 
      className={className}
      style={{ 
        borderRadius: rounded ? '50%' : '0', 
        width: size 
      }} 
    />
  );
}