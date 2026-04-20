export const locales = ['en', 'de', 'fr', 'es', 'pt', 'it', 'nl', 'pl', 'sv', 'zh'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'en';

/** Used by next-intl for date/time formatting; fixed zone avoids SSR/client markup drift. */
export const defaultTimeZone = 'UTC';

export const LOCALE_STORAGE_KEY = 'locale';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  pt: 'Português',
  it: 'Italiano',
  nl: 'Nederlands',
  pl: 'Polski',
  sv: 'Svenska',
  zh: '中文',
};
