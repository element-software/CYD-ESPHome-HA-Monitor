'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Script from 'next/script';
import Link from 'next/link';

const GA_ID = 'G-DVR5LT27RK';
const CONSENT_KEY = 'cookie_consent';

export default function CookieConsentManager() {
  const t = useTranslations('cookieConsent');
  const [consent, setConsent] = useState<'accepted' | 'declined' | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY) as 'accepted' | 'declined' | null;
    setConsent(stored);
    setShowBanner(stored === null);
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setConsent('accepted');
    setShowBanner(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setConsent('declined');
    setShowBanner(false);
  };

  return (
    <>
      {consent === 'accepted' && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}</Script>
        </>
      )}

      {showBanner && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" aria-hidden="true" />

          {/* Banner — bottom right */}
          <div className="fixed bottom-4 right-4 z-50 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">{t('title')}</h2>
            <p className="text-sm text-gray-600 mb-4">
              {t('message')}{' '}
              <Link href="/privacy-policy" className="underline hover:text-gray-900 transition-colors">
                {t('privacyPolicy')}
              </Link>
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={accept}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('accept')}
              </button>
              <button
                onClick={decline}
                className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {t('decline')}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
