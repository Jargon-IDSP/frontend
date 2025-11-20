import chinaFlag from "../assets/flags/chinaFlag.svg";
import franceFlag from "../assets/flags/franceFlag.svg";
import koreaFlag from "../assets/flags/koreaFlag.svg";
import spainFlag from "../assets/flags/spainFlag.svg";
import indiaFlag from "../assets/flags/indiaFlag.svg";
import philippinesFlag from "../assets/flags/philippinesFlag.svg";
import ukFlag from "../assets/flags/ukFlag.svg";

type LanguageKey = string;

interface LanguageFlag {
  src: string;
  alt: string;
}

const languageFlagMap: Record<LanguageKey, LanguageFlag> = {
  chinese: { src: chinaFlag, alt: "China flag" },
  french: { src: franceFlag, alt: "France flag" },
  korean: { src: koreaFlag, alt: "South Korea flag" },
  spanish: { src: spainFlag, alt: "Spain flag" },
  punjabi: { src: indiaFlag, alt: "India flag" },
  tagalog: { src: philippinesFlag, alt: "Philippines flag" },
  english: { src: ukFlag, alt: "United Kingdom flag" },
};

export const getLanguageFlag = (language: string | null): LanguageFlag | undefined => {
  if (!language) return undefined;
  return languageFlagMap[language.toLowerCase()] ?? undefined;
};

export type { LanguageFlag };

