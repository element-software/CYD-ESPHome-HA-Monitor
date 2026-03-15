'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function HomePageContent() {
  const t = useTranslations('home');

  return (
    <main className="min-h-screen bg-gray-50">
      <header
        className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 text-center overflow-hidden"
        aria-label={t('heroLabel')}
      >
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- decorative hero background; native img used for fetchPriority="high" support on static export */}
          <img
            src="/cyd.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-contain"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-black/70 z-[1]" aria-hidden />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg">
            {t('title')}
          </h1>
          <p className="text-xl md:text-2xl text-amber-100/95 drop-shadow-md">
            {t('subtitle')}
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">{t('whatIsCyd.title')}</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            {t.rich('whatIsCyd.p1', { strong: (c) => <strong>{c}</strong> })}
          </p>
          <p className="text-gray-700 leading-relaxed">
            {t('whatIsCyd.p2')}
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">{t('purpose.title')}</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            {t.rich('purpose.p1', { strong: (c) => <strong>{c}</strong> })}
          </p>
          <p className="text-gray-700 leading-relaxed">
            {t.rich('purpose.p2', { strong: (c) => <strong>{c}</strong> })}
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">{t('atAGlance.title')}</h2>
          <ul className="space-y-2 text-gray-700">
            <li>{t.rich('atAGlance.board', { strong: (c) => <strong>{c}</strong> })}</li>
            <li>{t.rich('atAGlance.displayPins', { strong: (c) => <strong>{c}</strong> })}</li>
            <li>{t.rich('atAGlance.rgbLed', { strong: (c) => <strong>{c}</strong> })}</li>
            <li>{t.rich('atAGlance.typicalUse', { strong: (c) => <strong>{c}</strong> })}</li>
          </ul>
          <p className="text-sm text-gray-500 mt-3">{t('atAGlance.note')}</p>
        </section>

        <section className="mb-12 rounded-xl bg-white border border-gray-200 p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t('configGeneratorCta.title')}</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            {t.rich('configGeneratorCta.description', { strong: (c) => <strong>{c}</strong> })}
          </p>
          <Link
            href="/config-generator"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-base font-semibold text-gray-900 shadow-sm hover:bg-amber-400 transition-colors"
          >
            {t('configGeneratorCta.button')}
            <span aria-hidden>→</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
