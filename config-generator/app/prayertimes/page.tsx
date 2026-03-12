import type { Metadata } from 'next';
import Link from 'next/link';
import { buildPageMetadata } from '@/lib/metadata';
import CydPrayerTimesPreview from '@/components/CydPrayerTimesPreview';

export const metadata: Metadata = buildPageMetadata({
  title: 'Prayer Times Display for CYD — prayertimes.dev',
  description:
    'Turn your Cheap Yellow Display (CYD) into an Islamic prayer times clock. Live countdown to the next prayer, Gregorian date, and more — powered by ESPHome.',
  imagePath: '/og/home.png',
  imageAlt: 'Prayer times CYD display showing clock, date and next prayer countdown',
});

export default function PrayerTimesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <header
        className="relative min-h-[60vh] flex flex-col items-center justify-center px-4 text-center overflow-hidden"
        aria-label="Hero"
      >
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/cyd.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-contain"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-black/75 z-[1]" aria-hidden />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Prayer Times Display
          </h1>
          <p className="text-xl md:text-2xl text-amber-100/95 drop-shadow-md">
            Turn your CYD into a beautiful Islamic prayer times clock
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Two-column layout: text + device preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start mb-14">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">About this project</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The <strong>CYD Prayer Times Display</strong> turns your{' '}
              <strong>ESP32-2432S028</strong> (Cheap Yellow Display) into a dedicated Islamic prayer
              times clock — always showing the current time, today&apos;s date, a live countdown
              ring to the next prayer, and the next prayer name with its scheduled time.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Prayer schedules are fetched from{' '}
              <a
                href="https://prayertimes.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 hover:text-amber-700 font-medium underline underline-offset-2"
              >
                prayertimes.dev
              </a>{' '}
              and delivered to the device via{' '}
              <strong>Home Assistant</strong> sensors — no cloud polling on the device itself.
            </p>
            <ul className="space-y-2 text-gray-700 mb-6">
              <li>🕐 <strong>Live clock</strong> — synced to Home Assistant time</li>
              <li>📅 <strong>Gregorian date</strong> — day, month, year</li>
              <li>⏳ <strong>Countdown ring</strong> — minutes until the next prayer</li>
              <li>🕌 <strong>Next prayer</strong> — name and scheduled time</li>
            </ul>
            <a
              href="https://prayertimes.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-base font-semibold text-gray-900 shadow-sm hover:bg-amber-400 transition-colors"
            >
              Visit prayertimes.dev
              <span aria-hidden>↗</span>
            </a>
          </div>

          {/* Device preview */}
          <div className="flex flex-col items-center">
            <p className="text-sm text-center text-gray-500 mb-2">Live screen preview</p>
            <CydPrayerTimesPreview showDeviceFrame />
          </div>
        </div>

        {/* What you need */}
        <section className="mb-10 rounded-xl bg-white border border-gray-200 p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What you need</h2>
          <ol className="space-y-3 text-gray-700 list-decimal list-inside">
            <li>
              A <strong>CYD (ESP32-2432S028)</strong> — available on{' '}
              <a
                href="https://amzn.to/3ZEIfdV"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 hover:text-amber-700 underline underline-offset-2"
              >
                Amazon
              </a>
            </li>
            <li>
              <strong>Home Assistant</strong> with the{' '}
              <a
                href="https://prayertimes.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-600 hover:text-amber-700 underline underline-offset-2"
              >
                prayertimes.dev
              </a>{' '}
              integration installed
            </li>
            <li>
              <strong>ESPHome</strong> (add-on or standalone) to flash the firmware
            </li>
            <li>
              The <strong>prayer times YAML</strong> for your device (see the project repository)
            </li>
          </ol>
        </section>

        {/* How it works */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">How it works</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            The CYD runs an ESPHome firmware that subscribes to a handful of Home Assistant sensor
            entities exposed by prayertimes.dev. The display is rendered with LVGL and updates
            automatically when values change:
          </p>
          <ul className="space-y-2 text-gray-700">
            <li>
              <strong>Clock &amp; date</strong> — driven by the ESPHome homeassistant time platform
            </li>
            <li>
              <strong>Countdown ring</strong> — reads a <em>minutes remaining</em> sensor from
              prayertimes.dev and animates the arc accordingly
            </li>
            <li>
              <strong>Next prayer</strong> — reads the prayer name and time sensors and displays
              them at the bottom of the screen
            </li>
          </ul>
        </section>

        {/* Link to config generator */}
        <section className="rounded-xl bg-white border border-gray-200 p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Building something else with your CYD?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Use our <strong>Config Generator</strong> to create a custom Home Assistant sensor
            dashboard for your CYD — pick sensors, set colours and icons, and get a ready-to-flash
            ESPHome YAML in one click.
          </p>
          <Link
            href="/config-generator"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-base font-semibold text-gray-900 shadow-sm hover:bg-amber-400 transition-colors"
          >
            Open Config Generator
            <span aria-hidden>→</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
