'use client';

import { useLocale } from './LocaleProvider';
import { locales, localeNames, type Locale } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      className="text-sm border border-gray-200 rounded-md px-2 py-1 bg-white text-gray-700 hover:border-gray-300 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
      aria-label="Select language"
    >
      {locales.map((l) => (
        <option key={l} value={l}>
          {localeNames[l]}
        </option>
      ))}
    </select>
  );
}
