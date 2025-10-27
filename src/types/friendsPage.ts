import type { Friend, PendingRequest, SearchResult } from "./friend";

export interface FriendsResponse {
  data: Friend[];
}

export interface PendingRequestsResponse {
  data: PendingRequest[];
}

export interface SearchResponse {
  data: SearchResult[];
}
