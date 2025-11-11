import type { User } from "../hooks/useLeaderboard";
import type { Friend, SearchResult, FriendProfile } from "../types/friend";
import { industryIdToName } from "../lib/api";

// Overloaded function signatures for type safety
export function getUserDisplayName(user: User): string;
export function getUserDisplayName(user: Friend | SearchResult | FriendProfile): string;
export function getUserDisplayName(user: {
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string;
} | null | undefined): string;

/**
 * Get display name for a user (username, full name, or email)
 * Supports multiple user types from different parts of the app
 */
export function getUserDisplayName(user: any): string {
  if (!user) return "Loading...";

  // Prioritize username if available
  if (user.username) return user.username;

  // Try to construct full name
  if (user.firstName || user.lastName) {
    return `${user.firstName || ""} ${user.lastName || ""}`.trim();
  }

  // Fallback to email or anonymous
  return user.email || "Anonymous User";
}

/**
 * Get industry name from industry ID
 */
export function getIndustryName(industryId: number | null | undefined): string {
  if (!industryId) return "Not set";
  return industryIdToName[industryId] || "Not set";
}

/**
 * Format date string to readable format
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
}

export function getLanguageCode(language: string | null): string {
  if (!language) return "ENG";

  const languageMap: { [key: string]: string } = {
    english: "ENG",
    chinese: "CHN",
    tagalog: "TGL",
    french: "FR",
    korean: "KO",
    spanish: "ES",
    punjabi: "PA",
  };

  return languageMap[language.toLowerCase()] || "ENG";
}
