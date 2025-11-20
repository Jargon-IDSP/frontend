import type { Term } from './learning';

export interface FlashcardsCarouselProps {
  terms: Term[];
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
  language: string;
  type: "existing" | "custom";
  totalCount: number;
  finishHref?: string;
}
