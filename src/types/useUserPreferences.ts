export interface UserPreferencesResponse {
  user: {
    language?: string;
    industryId?: number | null;
  };
}

export interface UserPreferences {
  language: string;
  industryId: number | null;
  userId: string;
}
