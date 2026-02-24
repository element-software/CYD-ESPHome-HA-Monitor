'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import Link from 'next/link';

const GA_ID = 'G-DVR5LT27RK';
const CONSENT_KEY = 'cookie_consent';

export default function CookieConsentManager() {
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
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
          <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="text-sm text-gray-600 flex-1">
              We use cookies to analyse site usage and improve your experience. No personal
              information is collected.{' '}
              <Link href="/privacy-policy" className="underline hover:text-gray-900 transition-colors">
                Privacy Policy
              </Link>
            </p>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={decline}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Decline
              </button>
              <button
                onClick={accept}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
