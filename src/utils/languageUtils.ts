/**
 * Language Utilities
 * Centralized language handling logic for the entire application
 * Types are in types/language.ts
 */

import type { Language } from '../types/language';
import type { Term } from '../types/learning';

export const DEFAULT_LANGUAGE: Language = 'english';

/**
 * Normalizes language string to valid Language type
 */
export function normalizeLanguage(lang?: string | null): Language {
  if (!lang) return DEFAULT_LANGUAGE;
  const normalized = lang.toLowerCase() as Language;
  const validLanguages: Language[] = ['english', 'french', 'chinese', 'spanish', 'tagalog', 'punjabi', 'korean'];
  return validLanguages.includes(normalized) ? normalized : DEFAULT_LANGUAGE;
}

/**
 * Checks if user has a second language (not English)
 */
export function hasSecondLanguage(language?: string | null): boolean {
  const normalized = normalizeLanguage(language);
  return normalized !== DEFAULT_LANGUAGE;
}

/**
 * Gets term in specified language with fallback to English
 * Handles both flat ({ term: string, nativeTerm: string })
 * and nested ({ english: string, french: string }) structures
 */
export function getTermInLanguage(
  termData: any,
  language: Language,
  fallback: string = 'N/A'
): string {
  if (!termData) return fallback;

  // Handle flat string
  if (typeof termData === 'string') return termData;

  // Handle nested object structure { english: 'text', french: 'texte', ... }
  if (typeof termData === 'object') {
    return termData[language] || termData.english || termData[DEFAULT_LANGUAGE] || fallback;
  }

  return fallback;
}

/**
 * Formats a flashcard with English + optional second language
 * Works with both prebuilt (existing) and custom flashcards
 */
export function formatFlashcardWithLanguage(
  flashcard: any,
  userLanguage?: string | null
): Term {
  const lang = normalizeLanguage(userLanguage);
  const hasSecondLang = hasSecondLanguage(userLanguage);

  // Handle both flat and nested structures
  const englishTerm = getTermInLanguage(flashcard.term || flashcard.termEnglish, 'english');
  const englishDef = getTermInLanguage(flashcard.definition || flashcard.definitionEnglish, 'english');

  return {
    id: flashcard.id,
    term: englishTerm,
    definition: englishDef,
    nativeTerm: hasSecondLang ? getTermInLanguage(flashcard.term, lang, undefined) : undefined,
    nativeDefinition: hasSecondLang ? getTermInLanguage(flashcard.definition, lang, undefined) : undefined,
    language: lang,
    industry: flashcard.industry?.name || flashcard.industry,
    industry_id: flashcard.industry_id || flashcard.industryId,
    level: flashcard.level?.name || flashcard.level,
    level_id: flashcard.level_id || flashcard.levelId,
  };
}

/**
 * Query parameter builder for language-aware API calls
 */
export function buildLanguageParams(
  language?: string | null,
  additionalParams?: Record<string, string | number | undefined | null>
): URLSearchParams {
  const params = new URLSearchParams();
  const lang = normalizeLanguage(language);

  params.set('language', lang);

  if (additionalParams) {
    Object.entries(additionalParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });
  }

  return params;
}

/**
 * Gets the language-specific field name for multilingual objects
 * e.g., getLanguageFieldName('term', 'french') => 'termFrench'
 */
export function getLanguageFieldName(fieldPrefix: string, language: Language): string {
  const capitalizedLang = language.charAt(0).toUpperCase() + language.slice(1);
  return `${fieldPrefix}${capitalizedLang}`;
}
