export const TopHat = ({ color = "#2c3e50", className = "TopHat" }) => (
  <svg 
    viewBox="0 0 200 200" 
    className={className}
    style={{ width: '100%', height: '100%' }}
  >
    <ellipse cx="100" cy="95" rx="60" ry="12" fill={color} opacity="0.8"/>
    <rect x="70" y="35" width="60" height="60" fill={color} rx="3"/>
    <rect x="65" y="90" width="70" height="8" fill={color} rx="2"/>
    <rect x="75" y="50" width="50" height="6" fill="#c0392b" rx="1"/>
    <ellipse cx="100" cy="35" rx="30" ry="5" fill={color} opacity="0.6"/>
  </svg>
);