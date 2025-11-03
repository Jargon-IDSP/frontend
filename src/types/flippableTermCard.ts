import type { Term } from './learning';

export interface FlippableTermCardProps {
  term: Term;
  language: string;
  type?: "existing" | "custom";
}
