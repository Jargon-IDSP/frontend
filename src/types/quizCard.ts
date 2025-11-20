import type { Quiz, CustomQuiz, UserQuizAttempt } from './learning';

export interface QuizCardProps {
  quiz: Quiz | CustomQuiz | UserQuizAttempt;
  index: number;
  type?: 'existing' | 'custom';
  hasAttempts?: boolean;
  category?: string;
}
