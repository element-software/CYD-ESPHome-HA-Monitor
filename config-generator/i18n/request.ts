import { getRequestConfig } from 'next-intl/server';
import { defaultTimeZone } from '@/lib/i18n';
import enMessages from '../messages/en.json';

/**
 * Minimal next-intl server config for static export.
 * All locale switching is handled client-side via LocaleProvider.
 * This config ensures next-intl doesn't throw ENVIRONMENT_FALLBACK
 * during static page pre-rendering.
 */
export default getRequestConfig(async () => ({
  locale: 'en',
  messages: enMessages,
  timeZone: defaultTimeZone,
}));
