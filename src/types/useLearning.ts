export interface UseLearningOptions {
  type: "existing" | "custom";
  endpoint: string;
  params?: Record<string, string>;
  enabled?: boolean;
}
