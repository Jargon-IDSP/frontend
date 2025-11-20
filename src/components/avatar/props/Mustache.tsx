export default function Mustache ({ color = "#3d2817", className = "avatar-accessory Mustache" }) {
  return (
  <svg
    viewBox="0 0 200 200"
    className={className}
  >
    <path 
      d="M 100 100 Q 85 95 70 95 Q 55 95 45 105 Q 40 110 45 115 Q 50 120 60 115 Q 70 110 80 108 Q 90 105 100 105 Z" 
      fill={color}
    />
    <path 
      d="M 100 100 Q 115 95 130 95 Q 145 95 155 105 Q 160 110 155 115 Q 150 120 140 115 Q 130 110 120 108 Q 110 105 100 105 Z" 
      fill={color}
    />
    <ellipse cx="100" cy="102" rx="8" ry="6" fill={color}/>
  </svg>
)
}