import { useState } from 'react';
import type { FlippableTermCardProps } from '../../types/flippableTermCard';
import PeekingCharacter from './PeekingCharacter';

export default function FlippableTermCard({
  term,
  type = "existing",
  shouldShowCharacter = false,
}: FlippableTermCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipCount, setFlipCount] = useState(0);
  const [isDescending, setIsDescending] = useState(false);

  const handleClick = () => {
    if (shouldShowCharacter && flipCount > 0) {
      // Character is visible, make it descend before flipping
      setIsDescending(true);

      setTimeout(() => {
        // After descent completes, flip the card
        setIsFlipped(!isFlipped);
        setIsDescending(false);

        // Wait for card flip to complete (0.6s) before showing character
        setTimeout(() => {
          setFlipCount(prev => prev + 1);
        }, 600);
      }, 500);
    } else {
      // First flip - just flip
      setIsFlipped(!isFlipped);
      if (shouldShowCharacter) {
        // Wait for card flip to complete before showing character
        setTimeout(() => {
          setFlipCount(prev => prev + 1);
        }, 600);
      }
    }
  };

  return (
    <div className="flip-card-wrapper">
      <PeekingCharacter
        isVisible={shouldShowCharacter}
        flipCount={flipCount}
        isDescending={isDescending}
      />
      <div className="flip-card-container" onClick={handleClick}>
      <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
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
    </div>
  );
}

