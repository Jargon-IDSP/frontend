export interface Choice {
  id: string;
  term: string;
  termId: string;
  isCorrect: boolean;
}

export interface QuestionData {
  questionId: string;
  prompt: string;
  choices: Choice[];
  difficulty: number;
  tags: string[];
  language: string;
  correctAnswerId: string;
}

export interface FetchResponse {
  success: boolean;
  data: QuestionData;
}

export interface FetchQuestionRequest {
  token: string;
  type: "existing" | "custom";
}

export interface ChoiceButtonProps {
  choice: Choice;
  selectedId: string | null;
  disabled: boolean;
  onSelect: (choice: Choice) => void;
}
