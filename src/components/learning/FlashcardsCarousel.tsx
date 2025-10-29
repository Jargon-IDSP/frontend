import type { Term } from '../../types/learning';
import FlippableTermCard from './FlippableTermCard';
import backIcon from "../../assets/icons/backButton.svg";
import nextIcon from "../../assets/icons/nextButton.svg";
import { BACKEND_URL } from '../../lib/api';

interface FlashcardsCarouselProps {
  terms: Term[];
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
  language: string;
  type: "existing" | "custom";
  totalCount: number;
}

export default function FlashcardsCarousel({
  terms,
  currentIndex,
  onNext,
  onPrevious,
  language,
  type,
  totalCount,
}: FlashcardsCarouselProps) {
  const currentTerm = terms[currentIndex];

  if (!currentTerm) {
    return null;
  }

  return (
    <div className="flashcards-carousel">
      <div className="flashcards-carousel-counter">
        Card {currentIndex + 1} of {totalCount}
      </div>

      <div className="flashcards-carousel-card">
        <FlippableTermCard
          term={currentTerm}
          language={language}
          type={type}
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
        
        {currentIndex === terms.length - 1 ? (
          <button
            onClick={() => window.location.href = `${BACKEND_URL}/learning/documents/cmha47br90001ztmchu5awy17/quizzes`}
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

      <div className="flashcards-carousel-progress">
        <div 
          className="flashcards-carousel-progress-bar"
          style={{ width: `${((currentIndex + 1) / totalCount) * 100}%` }}
        />
      </div>
    </div>
  );
}

