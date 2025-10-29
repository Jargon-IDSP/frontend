export type Language = 
  | 'english'
  | 'french'
  | 'chinese'
  | 'spanish'
  | 'tagalog'
  | 'punjabi'
  | 'korean';

export interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}

export const SupportedLanguages: LanguageOption[] = [
  { code: 'english', name: 'English', flag: '🇬🇧' },
  { code: 'french', name: 'French', flag: '🇫🇷' },
  { code: 'chinese', name: 'Chinese', flag: '🇨🇳' },
  { code: 'spanish', name: 'Spanish', flag: '🇪🇸' },
  { code: 'tagalog', name: 'Tagalog', flag: '🇵🇭' },
  { code: 'punjabi', name: 'Punjabi', flag: '🇮🇳' },
  { code: 'korean', name: 'Korean', flag: '🇰🇷' },
];

export interface MultilingualText {
  english: string;
  french: string;
  chinese: string;
  spanish: string;
  tagalog: string;
  punjabi: string;
  korean: string;
}

export type Multilingual<T extends string> = {
  [K in Language as `${T}${Capitalize<K>}`]: string;
};

