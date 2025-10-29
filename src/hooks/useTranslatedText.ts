import { useMemo } from "react";
import type { Translation } from "../types/document";
import { useUserPreferences } from "./useUserPreferences";

export function useTranslatedText(translation: Translation | undefined) {
  const { language: userLanguage } = useUserPreferences();

  return useMemo(() => {
    if (!translation) return "";

    const languageKey = `text${
      userLanguage.charAt(0).toUpperCase() + userLanguage.slice(1)
    }` as keyof Translation;
    
    return (translation[languageKey] as string) || translation.textEnglish;
  }, [translation, userLanguage]);
}
