import { useState } from 'react';
import type { FlippableTermCardProps } from '../../types/flippableTermCard';

export default function FlippableTermCard({
  term,
  type = "existing",
}: FlippableTermCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="flip-card-container" onClick={handleClick}>
      <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
        {/* Front side - shows English term */}
        <div className="flip-card-front">
          <div className="flip-card-content">
            {type === "existing" && term.industry && (
              <div className="flip-card-industry">{term.industry}</div>
            )}
            <div className="flip-card-term-text">{term.term}</div>
                <div className="flip-card-label">Definition:</div>
                <div className="flip-card-definition-text">
                    {term.definition || 'No definition available'}
                </div>
          </div>
        </div>

        {/* Back side - shows translation */}
        <div className="flip-card-back">
          <div className="flip-card-content">
            <div className="flip-card-label">Translation:</div>
            <div className="flip-card-translation-text">
              {term.nativeTerm || 'No translation available'}
            </div>
            <div>
                <div className="flip-card-label">Definition:</div>
                <div className="flip-card-definition-text">
                    {term.nativeDefinition || 'No definition available'}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

