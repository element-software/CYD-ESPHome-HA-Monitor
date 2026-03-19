'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

const BUY_NOW_URL = 'https://amzn.to/3ZEIfdV';

function CydLink({ children }: { children: React.ReactNode }) {
  return (
    <a
      href={BUY_NOW_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="text-amber-600 hover:text-amber-700 font-semibold underline underline-offset-2"
    >
      {children}
    </a>
  );
}

const richComponents = {
  strong: (c: React.ReactNode) => <strong>{c}</strong>,
  code: (c: React.ReactNode) => <code className="bg-gray-100 px-1 rounded text-sm">{c}</code>,
  cydLink: (c: React.ReactNode) => <CydLink>{c}</CydLink>,
};

export default function AboutCydContent() {
  const t = useTranslations('aboutCyd');

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            {t('backToHome')}
          </Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {t.rich('title', richComponents)}
        </h1>
        <p className="text-gray-600 mb-8">{t('subtitle')}</p>

        <div className="prose prose-gray max-w-none space-y-10 text-gray-700">
          {/* What is a CYD */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('whatIsCyd.title')}</h2>
            <p className="leading-relaxed">{t.rich('whatIsCyd.p1', richComponents)}</p>
            <p className="leading-relaxed mt-3">{t.rich('whatIsCyd.p2', richComponents)}</p>
          </section>

          {/* CYD variations */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('variations.title')}</h2>
            <p className="leading-relaxed mb-4">{t.rich('variations.intro', richComponents)}</p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">{t('variations.screenSize.title')}</h3>
            <p className="leading-relaxed mb-2">{t.rich('variations.screenSize.intro', richComponents)}</p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li>{t.rich('variations.screenSize.size24', richComponents)}</li>
              <li>{t.rich('variations.screenSize.size28', richComponents)}</li>
              <li>{t.rich('variations.screenSize.size32', richComponents)}</li>
            </ul>
            <p className="leading-relaxed text-sm text-gray-600">{t('variations.screenSize.note')}</p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">{t('variations.touchType.title')}</h3>
            <p className="leading-relaxed mb-2">{t.rich('variations.touchType.intro', richComponents)}</p>
            <ul className="list-disc pl-6 space-y-1 mb-2">
              <li>{t.rich('variations.touchType.xpt2046', richComponents)}</li>
              <li>{t.rich('variations.touchType.cst816', richComponents)}</li>
              <li>{t('variations.touchType.other')}</li>
            </ul>
            <p className="leading-relaxed text-sm text-gray-600">{t('variations.touchType.note')}</p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">{t('variations.displayController.title')}</h3>
            <p className="leading-relaxed mb-4">{t.rich('variations.displayController.p', richComponents)}</p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">{t('variations.usbConnector.title')}</h3>
            <p className="leading-relaxed mb-4">{t.rich('variations.usbConnector.p', richComponents)}</p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">{t('variations.whatSiteTargets.title')}</h3>
            <p className="leading-relaxed">{t.rich('variations.whatSiteTargets.p', richComponents)}</p>
          </section>

          {/* Hardware block diagram */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('hardware.title')}</h2>
            <p className="leading-relaxed mb-4">{t.rich('hardware.intro', richComponents)}</p>
            <div className="rounded-xl border border-gray-200 bg-white p-6 overflow-x-auto">
              <svg
                viewBox="0 0 640 320"
                className="w-full max-w-2xl mx-auto h-auto"
                aria-label={t('hardware.diagramLabel')}
              >
                <defs>
                  <linearGradient id="esp32g" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#E65100" />
                    <stop offset="100%" stopColor="#BF360C" />
                  </linearGradient>
                  <linearGradient id="tftg" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1B5E20" />
                    <stop offset="100%" stopColor="#0D3310" />
                  </linearGradient>
                  <linearGradient id="touchg" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#0D47A1" />
                    <stop offset="100%" stopColor="#002171" />
                  </linearGradient>
                </defs>
                <rect x="40" y="80" width="140" height="160" rx="8" fill="url(#esp32g)" />
                <text x="110" y="130" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">ESP32</text>
                <text x="110" y="155" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="11">WROOM-32</text>
                <text x="110" y="178" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="10">WiFi + BLE</text>
                <text x="110" y="198" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="10">Dual-core 240MHz</text>
                <rect x="240" y="60" width="160" height="200" rx="8" fill="url(#tftg)" />
                <text x="320" y="100" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">TFT Display</text>
                <text x="320" y="125" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="11">ILI9341</text>
                <text x="320" y="150" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="10">2.8″ 240×320</text>
                <rect x="260" y="170" width="120" height="70" rx="4" fill="#000" opacity="0.5" />
                <text x="320" y="205" textAnchor="middle" fill="#81C784" fontSize="10">SPI (HSPI)</text>
                <rect x="460" y="100" width="140" height="120" rx="8" fill="url(#touchg)" />
                <text x="530" y="135" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">Touch</text>
                <text x="530" y="158" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="11">XPT2046 / CST816</text>
                <text x="530" y="182" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="10">SPI or I2C</text>
                <rect x="240" y="280" width="80" height="36" rx="6" fill="#4A148C" />
                <text x="280" y="302" textAnchor="middle" fill="white" fontSize="10">RGB LED</text>
                <rect x="340" y="280" width="80" height="36" rx="6" fill="#004D40" />
                <text x="380" y="302" textAnchor="middle" fill="white" fontSize="10">microSD</text>
                <rect x="440" y="280" width="80" height="36" rx="6" fill="#E65100" />
                <text x="480" y="302" textAnchor="middle" fill="white" fontSize="10">LDR</text>
                <path d="M180 160 L230 160" stroke="#666" strokeWidth="2" markerEnd="url(#arrow)" />
                <path d="M400 160 L450 160" stroke="#666" strokeWidth="2" />
                <path d="M180 200 L230 200" stroke="#666" strokeWidth="2" strokeDasharray="4 2" />
                <path d="M320 260 L320 276" stroke="#666" strokeWidth="2" />
                <path d="M380 260 L380 276" stroke="#666" strokeWidth="2" />
                <path d="M480 220 L480 276" stroke="#666" strokeWidth="2" />
                <defs>
                  <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L9,3 z" fill="#666" />
                  </marker>
                </defs>
              </svg>
            </div>
            <p className="text-sm text-gray-500 mt-2">{t('hardware.diagramCaption')}</p>
          </section>

          {/* Component table */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('components.title')}</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 font-semibold text-gray-900">{t('components.colComponent')}</th>
                    <th className="px-4 py-3 font-semibold text-gray-900">{t('components.colDetails')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-800">{t('components.board.name')}</td>
                    <td className="px-4 py-3">{t.rich('components.board.details', richComponents)}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-800">{t('components.mcu.name')}</td>
                    <td className="px-4 py-3">{t('components.mcu.details')}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-800">{t('components.display.name')}</td>
                    <td className="px-4 py-3">{t('components.display.details')}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-800">{t('components.touch.name')}</td>
                    <td className="px-4 py-3">{t('components.touch.details')}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-800">{t('components.rgbLed.name')}</td>
                    <td className="px-4 py-3">{t('components.rgbLed.details')}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-800">{t('components.microsd.name')}</td>
                    <td className="px-4 py-3">{t('components.microsd.details')}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-800">{t('components.ldr.name')}</td>
                    <td className="px-4 py-3">{t('components.ldr.details')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Pinout */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('pinout.title')}</h2>
            <p className="leading-relaxed mb-4">{t('pinout.intro')}</p>
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 font-semibold text-gray-900">{t('pinout.colFunction')}</th>
                    <th className="px-4 py-3 font-semibold text-gray-900">{t('pinout.colGpio')}</th>
                    <th className="px-4 py-3 font-semibold text-gray-900">{t('pinout.colNotes')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-2 font-medium">TFT CLK</td>
                    <td className="px-4 py-2 font-mono">14</td>
                    <td className="px-4 py-2">{t('pinout.rows.tftClkNotes')}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">TFT MOSI</td>
                    <td className="px-4 py-2 font-mono">13</td>
                    <td className="px-4 py-2">{t('pinout.rows.tftMosiNotes')}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">TFT MISO</td>
                    <td className="px-4 py-2 font-mono">12</td>
                    <td className="px-4 py-2">{t('pinout.rows.tftMisoNotes')}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">TFT CS</td>
                    <td className="px-4 py-2 font-mono">15</td>
                    <td className="px-4 py-2">{t('pinout.rows.tftCsNotes')}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">TFT DC / RS</td>
                    <td className="px-4 py-2 font-mono">2</td>
                    <td className="px-4 py-2">{t('pinout.rows.tftDcNotes')}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Backlight</td>
                    <td className="px-4 py-2 font-mono">21</td>
                    <td className="px-4 py-2">{t('pinout.rows.backlightNotes')}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Touch (XPT2046)</td>
                    <td className="px-4 py-2 font-mono">—</td>
                    <td className="px-4 py-2">{t('pinout.rows.touchXptNotes')}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Touch (CST816 I2C)</td>
                    <td className="px-4 py-2 font-mono">SDA 18, SCL 19</td>
                    <td className="px-4 py-2">{t('pinout.rows.touchCstNotes')}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">RGB LED R / G / B</td>
                    <td className="px-4 py-2 font-mono">4, 16, 17</td>
                    <td className="px-4 py-2">{t('pinout.rows.rgbLedNotes')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Software stack diagram */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('software.title')}</h2>
            <p className="leading-relaxed mb-4">{t.rich('software.intro', richComponents)}</p>
            <div className="rounded-xl border border-gray-200 bg-white p-6 overflow-x-auto">
              <svg
                viewBox="0 0 560 200"
                className="w-full max-w-2xl mx-auto h-auto"
                aria-label={t('software.diagramLabel')}
              >
                <rect x="20" y="60" width="120" height="80" rx="8" fill="#E3F2FD" stroke="#1976D2" strokeWidth="2" />
                <text x="80" y="95" textAnchor="middle" fill="#0D47A1" fontSize="12" fontWeight="bold">Home</text>
                <text x="80" y="115" textAnchor="middle" fill="#1565C0" fontSize="11">Assistant</text>
                <text x="80" y="132" textAnchor="middle" fill="#1976D2" fontSize="10">Entities / API</text>
                <path d="M140 100 L200 100" stroke="#666" strokeWidth="2" />
                <polygon points="195,95 200,100 195,105" fill="#666" />
                <text x="170" y="90" textAnchor="middle" fill="#555" fontSize="9">API</text>
                <rect x="200" y="60" width="120" height="80" rx="8" fill="#FFF3E0" stroke="#E65100" strokeWidth="2" />
                <text x="260" y="95" textAnchor="middle" fill="#BF360C" fontSize="12" fontWeight="bold">ESPHome</text>
                <text x="260" y="115" textAnchor="middle" fill="#E65100" fontSize="11">YAML + LVGL</text>
                <text x="260" y="132" textAnchor="middle" fill="#F57C00" fontSize="10">Renders UI</text>
                <path d="M320 100 L380 100" stroke="#666" strokeWidth="2" />
                <polygon points="375,95 380,100 375,105" fill="#666" />
                <text x="350" y="90" textAnchor="middle" fill="#555" fontSize="9">SPI / I2C</text>
                <rect x="380" y="60" width="120" height="80" rx="8" fill="#E8F5E9" stroke="#2E7D32" strokeWidth="2" />
                <text x="440" y="95" textAnchor="middle" fill="#1B5E20" fontSize="12" fontWeight="bold">CYD</text>
                <text x="440" y="115" textAnchor="middle" fill="#2E7D32" fontSize="11">Display + Touch</text>
                <text x="440" y="132" textAnchor="middle" fill="#388E3C" fontSize="10">Hardware</text>
                <text x="280" y="175" textAnchor="middle" fill="#666" fontSize="10">
                  Sensors &amp; state → HA → ESPHome → CYD screen
                </text>
              </svg>
            </div>
          </section>

          {/* Use cases */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('useCases.title')}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t.rich('useCases.monitor', richComponents)}</li>
              <li>{t.rich('useCases.controlPanel', richComponents)}</li>
              <li>{t.rich('useCases.weather', richComponents)}</li>
              <li>{t.rich('useCases.prototyping', richComponents)}</li>
            </ul>
          </section>

          {/* References */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('references.title')}</h2>
            <p className="leading-relaxed mb-4">{t.rich('references.intro', richComponents)}</p>
            <ul className="space-y-3">
              <li>
                <a href={BUY_NOW_URL} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 font-medium underline underline-offset-2">
                  {t('references.amazon')}
                </a>{' '}{t('references.amazonDesc')}
              </li>
              <li>
                <a href="https://esphome.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                  {t('references.esphome')}
                </a>{' '}{t('references.esphomeDesc')}
              </li>
              <li>
                <a href="https://esphome.io/components/display/ili9341.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                  {t('references.esphomeDisplay')}
                </a>{' '}{t('references.esphomeDisplayDesc')}
              </li>
              <li>
                <a href="https://www.home-assistant.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                  {t('references.homeAssistant')}
                </a>{' '}{t('references.homeAssistantDesc')}
              </li>
              <li>
                <a href="https://github.com/element-software/CYD-ESPHome-HA-Monitor" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                  {t('references.github')}
                </a>{' '}{t('references.githubDesc')}
              </li>
              <li>
                <a href="https://github.com/drrcastro/CYD-Smart-Dashboard-for-Home-Assistant" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                  {t('references.community')}
                </a>{' '}{t('references.communityDesc')}
              </li>
              <li>
                <a href="https://docs.espressif.com/projects/esp-idf/en/latest/esp32/hw-reference/esp32/get-started-devkitc.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                  {t('references.esp32')}
                </a>{' '}{t('references.esp32Desc')}
              </li>
              <li>
                <a href="https://www.buydisplay.com/download/ic/ILI9341.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                  {t('references.ili9341')}
                </a>{' '}{t('references.ili9341Desc')}
              </li>
            </ul>
          </section>

          {/* CTA */}
          <section className="rounded-xl bg-white border border-gray-200 p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('cta.title')}</h2>
            <p className="text-gray-700 mb-4">{t.rich('cta.description', richComponents)}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/config-generator"
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-amber-400 transition-colors"
              >
                {t('cta.openGenerator')}
                <span aria-hidden>→</span>
              </Link>
              <a
                href={BUY_NOW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-amber-500 px-5 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
              >
                {t('cta.buyCyd')}
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
