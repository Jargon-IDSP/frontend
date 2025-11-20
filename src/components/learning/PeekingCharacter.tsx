import React, { useEffect, useState } from 'react';
import '../../styles/components/_peekingCharacter.scss';
import peekingCharacterWithArms from '../../assets/peeking-character.svg';
import peekingCharacterNoArms from '../../assets/peeking-character1.svg';

interface PeekingCharacterProps {
  isVisible: boolean;
  flipCount: number;
  isDescending: boolean;
}

const PeekingCharacter: React.FC<PeekingCharacterProps> = ({ isVisible, flipCount, isDescending }) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [showArms, setShowArms] = useState(false);

  useEffect(() => {
    if (isVisible && !isDescending) {
      // Force animation restart by removing class
      setShowAnimation(false);

      // Use requestAnimationFrame to ensure DOM update before re-adding
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setShowAnimation(true);
        });
      });

      // Delay arms appearing until after peek animation completes (0.6s delay + 0.5s animation = 1.1s)
      const armsTimer = setTimeout(() => {
        setShowArms(true);
      }, 1100);

      return () => clearTimeout(armsTimer);
    }
  }, [isVisible, flipCount, isDescending]);

  // Reset arms when descending
  useEffect(() => {
    if (isDescending) {
      setShowArms(false);
      setShowAnimation(false);
    }
  }, [isDescending]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`peeking-character ${showAnimation ? 'peeking-character--animate' : ''} ${isDescending ? 'peeking-character--descend' : ''}`}>
      <img
        src={showArms ? peekingCharacterWithArms : peekingCharacterNoArms}
        alt=""
        className="peeking-character__image"
      />
    </div>
  );
};

export default PeekingCharacter;
