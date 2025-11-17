export interface StudyTypeCardProps {
  name: string;
  start_button_text: string;
  onClick: () => void;
  color: string;
  isLocked?: boolean;
  lockMessage?: string;
  score?: number;
}
