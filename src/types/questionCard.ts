import type { Question, CustomQuestion } from './learning';

export interface QuestionCardProps {
  question: Question | CustomQuestion;
  index: number;
  type?: 'existing' | 'custom';
}
