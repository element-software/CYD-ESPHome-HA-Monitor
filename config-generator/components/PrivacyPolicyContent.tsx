'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function PrivacyPolicyContent() {
  const t = useTranslations('privacyPolicy');

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
            {t('backToConfigGenerator')}
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('title')}</h1>
        <p className="text-sm text-gray-500 mb-8">{t('lastUpdated')}</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700">

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('intro.title')}</h2>
            <p>{t.rich('intro.p1', { strong: (c) => <strong>{c}</strong> })}</p>
            <p className="mt-3">{t('intro.p2')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('infoCollect.title')}</h2>
            <p>{t('infoCollect.intro')}</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>{t.rich('infoCollect.analytics', { strong: (c) => <strong>{c}</strong> })}</li>
              <li>{t.rich('infoCollect.personal', { strong: (c) => <strong>{c}</strong> })}</li>
            </ul>
            <p className="mt-3">{t('infoCollect.noConsent')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('howWeUse.title')}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t.rich('howWeUse.analytics', { strong: (c) => <strong>{c}</strong> })}</li>
              <li>{t.rich('howWeUse.contact', { strong: (c) => <strong>{c}</strong> })}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('legalBasis.title')}</h2>
            <p>{t('legalBasis.intro')}</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>{t.rich('legalBasis.consent', { strong: (c) => <strong>{c}</strong> })}</li>
              <li>{t.rich('legalBasis.legitimate', { strong: (c) => <strong>{c}</strong> })}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('cookies.title')}</h2>
            <p>{t.rich('cookies.p1', { code: (c) => <code className="bg-gray-100 px-1 rounded text-sm">{c}</code> })}</p>
            <p className="mt-3">
              {t.rich('cookies.p2', {
                code: (c) => <code className="bg-gray-100 px-1 rounded text-sm">{c}</code>,
                googlePrivacy: (c) => <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{c}</a>,
              })}
            </p>
            <p className="mt-3">{t('cookies.p3')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('dataSharing.title')}</h2>
            <p>
              {t.rich('dataSharing.p', {
                googlePrivacy: (c) => <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{c}</a>,
              })}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('dataRetention.title')}</h2>
            <p>{t('dataRetention.p')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('yourRights.title')}</h2>
            <p>{t('yourRights.intro')}</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>{t('yourRights.access')}</li>
              <li>{t('yourRights.correction')}</li>
              <li>{t('yourRights.erasure')}</li>
              <li>{t('yourRights.restriction')}</li>
              <li>{t('yourRights.withdraw')}</li>
              <li>
                {t.rich('yourRights.complain', {
                  ico: (c) => <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{c}</a>,
                })}
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('thirdParty.title')}</h2>
            <p>{t('thirdParty.p')}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('contact.title')}</h2>
            <p>
              {t.rich('contact.p', {
                email: (c) => <a href="mailto:info@cheapyellowdisplay.co.uk" className="text-blue-600 hover:underline">{c}</a>,
              })}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('changes.title')}</h2>
            <p>{t('changes.p')}</p>
          </section>

        </div>
      </div>
    </main>
  );
}
