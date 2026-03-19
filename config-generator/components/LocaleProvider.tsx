'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { type Locale, defaultLocale, LOCALE_STORAGE_KEY, locales } from '@/lib/i18n';
import enMessages from '@/messages/en.json';
import deMessages from '@/messages/de.json';
import frMessages from '@/messages/fr.json';
import esMessages from '@/messages/es.json';
import ptMessages from '@/messages/pt.json';
import itMessages from '@/messages/it.json';
import nlMessages from '@/messages/nl.json';
import plMessages from '@/messages/pl.json';
import svMessages from '@/messages/sv.json';
import zhMessages from '@/messages/zh.json';

const allMessages = {
  en: enMessages,
  de: deMessages,
  fr: frMessages,
  es: esMessages,
  pt: ptMessages,
  it: itMessages,
  nl: nlMessages,
  pl: plMessages,
  sv: svMessages,
  zh: zhMessages,
} as const;

type LocaleContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextType>({
  locale: defaultLocale,
  setLocale: () => {},
});

export function useLocale() {
  return useContext(LocaleContext);
}

function detectLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null;
  if (stored && (locales as readonly string[]).includes(stored)) return stored;
  const browserLang = navigator.language?.split('-')[0] as Locale;
  if ((locales as readonly string[]).includes(browserLang)) return browserLang;
  return defaultLocale;
}

export default function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const detected = detectLocale();
    setLocaleState(detected);
    document.documentElement.lang = detected;
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    document.documentElement.lang = newLocale;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={allMessages[locale]}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}
