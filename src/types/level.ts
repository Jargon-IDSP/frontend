export interface Level {
  id: number;
  name: string;
  completed: boolean;
  unlocked?: boolean;
  quizzesCompleted?: number;
  lockedReason?: string;
}

export interface LevelsResponse {
  data: Level[];
}
