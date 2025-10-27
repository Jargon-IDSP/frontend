export interface ChatHealthResponse {
  model?: string;
}

export interface ChatRequest {
  prompt: string;
  token: string;
  signal: AbortSignal;
}
