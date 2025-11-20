export interface MonthlyActivityData {
  month: string;
  year: number;
  daysActive: number;
  maxDays: number;
}

export interface MonthlyActivityResponse {
  success: boolean;
  data: MonthlyActivityData[];
}

