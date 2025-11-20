import type { Term } from "./learning";

export interface TermCardProps {
  term: Term;
  index: number;
  language: string;
  type?: "existing" | "custom";
}
