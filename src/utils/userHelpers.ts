import type { User } from "../hooks/useLeaderboard";

export function getUserDisplayName(user: User): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.firstName) {
    return user.firstName;
  }
  if (user.lastName) {
    return user.lastName;
  }
  return "Anonymous User";
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
