import type { Friend, PendingRequest, SearchResult } from "../friend";

// Friends API Response types
export interface FriendsResponse {
  data: Friend[];
}

export interface PendingRequestsResponse {
  data: PendingRequest[];
}

export interface SearchResponse {
  data: SearchResult[];
}

// Quiz sharing types
export interface ShareQuizRequest {
  customQuizId: string;
  friendUserIds: string[];
  token: string;
}

export interface ShareQuizResponse {
  data: {
    totalShared: number;
  };
  error?: string;
}
