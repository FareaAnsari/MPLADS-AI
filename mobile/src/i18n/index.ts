import { SupportedLocale, TranslationDictionary } from './types';
import { enIN } from './locales/en-IN';
import { hiIN } from './locales/hi-IN';
import { useAppStore } from '../store/appStore';

export const DICTIONARIES: Record<SupportedLocale, TranslationDictionary> = {
  'en-IN': enIN,
  'hi-IN': hiIN,
};

/**
 * Translates a keypath (e.g. 'common.submit' or 'auth.signIn') into localized string.
 * Supports fallback to English if key is missing in target language.
 */
export const t = (
  keyPath: string,
  params?: Record<string, string | number>,
  forcedLocale?: SupportedLocale
): string => {
  const currentLang = useAppStore.getState().language;
  const targetLocale: SupportedLocale = forcedLocale || (currentLang === 'hi' ? 'hi-IN' : 'en-IN');

  const dict = DICTIONARIES[targetLocale] || enIN;
  const parts = keyPath.split('.');

  let current: any = dict;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      // Fallback to English
      let fallbackCurrent: any = enIN;
      for (const fPart of parts) {
        if (fallbackCurrent && typeof fallbackCurrent === 'object' && fPart in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[fPart];
        } else {
          return keyPath; // Return raw key if not found
        }
      }
      current = fallbackCurrent;
      break;
    }
  }

  if (typeof current !== 'string') {
    return keyPath;
  }

  let result = current;
  if (params) {
    Object.entries(params).forEach(([key, val]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), String(val));
    });
  }

  return result;
};

/**
 * React hook returning current locale and translation function t().
 */
export const useTranslation = () => {
  const language = useAppStore((s) => s.language);
  const locale: SupportedLocale = language === 'hi' ? 'hi-IN' : 'en-IN';

  return {
    locale,
    language,
    t: (keyPath: string, params?: Record<string, string | number>) => t(keyPath, params, locale),
    isHindi: language === 'hi',
  };
};

export * from './types';
export { enIN, hiIN };

