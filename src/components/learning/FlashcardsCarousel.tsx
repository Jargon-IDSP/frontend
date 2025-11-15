import { useState } from 'react';
import FlippableTermCard from './FlippableTermCard';
import backIcon from "../../assets/icons/backButton.svg";
import nextIcon from "../../assets/icons/nextButton.svg";
import { useNavigate } from 'react-router-dom';
import type { FlashcardsCarouselProps } from '../../types/flashcardsCarousel';

export default function FlashcardsCarousel({
  terms,
  currentIndex,
  onNext,
  onPrevious,
  language,
  type,
  totalCount,
  finishHref,
}: FlashcardsCarouselProps) {
  const navigate = useNavigate();
  const currentTerm = terms[currentIndex];
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); 
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentIndex < terms.length - 1) {
      onNext();
    }

    if (isRightSwipe && currentIndex > 0) {
      onPrevious();
    }
  };

  if (!currentTerm) {
    return null;
  }

  return (
    <div
      className="flashcards-carousel"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="flashcards-carousel-card">
        <FlippableTermCard
          term={currentTerm}
          language={language}
          type={type}
          shouldShowCharacter={true}
        />
      </div>

      <div className="flashcards-carousel-navigation">
        <button
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="flashcards-carousel-button"
        >
          <img src={backIcon} alt="Previous" width="24" height="24" />
        </button>

        <div className="flashcards-carousel-counter">
        Card {currentIndex + 1} of {totalCount}
      </div>
        
        {currentIndex === terms.length - 1 ? (
          <button
            onClick={() => {
              if (finishHref) {
                navigate(finishHref);
              }
            }}
            className="flashcards-carousel-button flashcards-carousel-finish"
          >
            Finish
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={currentIndex === terms.length - 1}
            className="flashcards-carousel-button"
          >
            <img src={nextIcon} alt="Next" width="24" height="24" />
          </button>
        )}
      </div>
       </div>
  );
}

