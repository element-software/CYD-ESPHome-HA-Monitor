import type { Metadata } from 'next';
import Link from 'next/link';
import { buildPageMetadata } from '@/lib/metadata';

const BUY_NOW_URL = 'https://amzn.to/3ZEIfdV';

export const metadata: Metadata = buildPageMetadata({
  title: 'About the CYD (Cheap Yellow Display) — Full Guide',
  description:
    'Complete guide to the CYD (Cheap Yellow Display): variations, hardware, pinout, diagrams, ESPHome, and Home Assistant integration with reference links.',
  imagePath: '/og/about-cyd.png',
  imageAlt: 'About the CYD (Cheap Yellow Display) — Full Guide',
});

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

export default function AboutCydPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          About the <CydLink>CYD</CydLink> (Cheap Yellow Display)
        </h1>
        <p className="text-gray-600 mb-8">
          A complete guide to the CYD family — variations, hardware, pinout, software stack, and references.
        </p>

        <div className="prose prose-gray max-w-none space-y-10 text-gray-700">
          {/* What is a CYD */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What is a CYD?</h2>
            <p className="leading-relaxed">
              The <strong>Cheap Yellow Display</strong> (<CydLink>CYD</CydLink>) is the popular
              community name for ESP32-based boards that combine a microcontroller with a colour
              TFT touchscreen in one unit. The best-known model is the <strong>ESP32-2432S028</strong> (2.8″
              screen, 240×320), but <strong>several variations exist</strong> — different screen
              sizes, touch technologies, and connectors. They share the same appeal: build
              dashboards, status displays, and control panels without wiring a separate screen.
            </p>
            <p className="leading-relaxed mt-3">
              Because the display and ESP32 are on one board, you can build a full GUI device (e.g.
              a Home Assistant monitor) by flashing firmware and connecting to Wi‑Fi — no soldering
              or complex wiring required. You can <CydLink>buy a CYD on Amazon</CydLink> and be up
              and running the same day.
            </p>
          </section>

          {/* CYD variations */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">CYD variations</h2>
            <p className="leading-relaxed mb-4">
              Not all “CYD-style” boards are identical. When buying or configuring a <CydLink>CYD</CydLink>,
              check these aspects — they affect compatibility with cases, cables, and firmware (including
              this site’s config generator).
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Screen size and resolution</h3>
            <p className="leading-relaxed mb-2">
              Boards are sold in different physical sizes and resolutions. Model numbers often encode
              size (e.g. <strong>S028</strong> ≈ 2.8″, <strong>S035</strong> ≈ 3.5″). Common variants:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-4">
              <li><strong>2.4″</strong> — Smaller, often 240×320; some use ILI9341 or ST7789.</li>
              <li><strong>2.8″ (e.g. ESP32-2432S028)</strong> — The most common “CYD”: 240×320, usually ILI9341. This project’s config generator and HAMon are designed for this size and resolution.</li>
              <li><strong>3.2″ / 3.5″</strong> — Larger panels (e.g. 320×480); may use ILI9486, ILI9488, or other drivers. Pinouts and ESPHome config differ from the 2.8″ boards.</li>
            </ul>
            <p className="leading-relaxed text-sm text-gray-600">
              If you have a different size or resolution, you may need to adjust display dimensions and
              driver in ESPHome; the pinout and touch type still matter (see below).
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Touch screen type</h3>
            <p className="leading-relaxed mb-2">
              Touch is either <strong>resistive</strong> (SPI) or <strong>capacitive</strong> (I2C).
              The driver and GPIOs are different, so firmware must match your board:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-2">
              <li><strong>XPT2046</strong> — Resistive touch over SPI. Shares the display’s SPI bus with a separate chip-select (e.g. GPIO 33). Backlight is often on <strong>GPIO 21</strong>. This is the “SPI touch” preset in our config generator.</li>
              <li><strong>CST816</strong> — Capacitive touch over I2C (e.g. SDA 33, SCL 32). Newer/revision boards often use this. Backlight is often on <strong>GPIO 27</strong>. This is the “I2C touch” preset in our config generator.</li>
              <li>Some boards use other controllers (e.g. GT911). You’ll need the correct ESPHome touch component and pinout for your specific module.</li>
            </ul>
            <p className="leading-relaxed text-sm text-gray-600">
              If touch or backlight behaves oddly, confirm whether you have the SPI (XPT2046) or I2C (CST816) variant and select the matching preset or custom pins.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Display controller</h3>
            <p className="leading-relaxed mb-4">
              Most 2.8″ CYD boards use the <strong>ILI9341</strong> TFT controller. Other sizes may use
              <strong>ST7789</strong>, <strong>ILI9488</strong>, <strong>ILI9486</strong>, or similar. In ESPHome you
              choose the matching display platform (e.g. <code className="bg-gray-100 px-1 rounded text-sm">ili9xxx</code> with
              <code className="bg-gray-100 px-1 rounded text-sm">model: ili9341</code>). Our generator assumes ILI9341 for the 2.8″ 240×320 layout.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">USB connector</h3>
            <p className="leading-relaxed mb-4">
              Boards are sold with <strong>Micro-USB</strong> or <strong>USB-C</strong>. USB-C is
              preferred for new purchases: easier cabling and many 3D-printed cases (e.g. the Aura
              Smart Display case) are designed for the USB-C port. Adapters (e.g. 90° USB-C) help with
              cable routing. Our <CydLink>Amazon link</CydLink> points to the USB-C version.
            </p>

            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">What this site targets</h3>
            <p className="leading-relaxed">
              The <strong>Config Generator</strong> and <strong>HAMon</strong> firmware on this site
              are aimed at <strong>2.8″ 240×320 ILI9341</strong> boards with either
              <strong>XPT2046 (SPI touch)</strong> or <strong>CST816 (I2C touch)</strong>. If you have
              a different size or display driver, you can still use the generator as a starting point
              and adjust the generated YAML (display model, dimensions, touch component, and pins) to match
              your hardware.
            </p>
          </section>

          {/* Hardware block diagram */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Hardware Overview</h2>
            <p className="leading-relaxed mb-4">
              The <CydLink>CYD</CydLink> integrates several components on a single PCB. The diagram
              below shows how the main blocks connect.
            </p>
            <div className="rounded-xl border border-gray-200 bg-white p-6 overflow-x-auto">
              <svg
                viewBox="0 0 640 320"
                className="w-full max-w-2xl mx-auto h-auto"
                aria-label="CYD hardware block diagram"
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
                {/* ESP32 */}
                <rect x="40" y="80" width="140" height="160" rx="8" fill="url(#esp32g)" />
                <text x="110" y="130" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                  ESP32
                </text>
                <text x="110" y="155" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="11">
                  WROOM-32
                </text>
                <text x="110" y="178" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="10">
                  WiFi + BLE
                </text>
                <text x="110" y="198" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="10">
                  Dual-core 240MHz
                </text>
                {/* TFT */}
                <rect x="240" y="60" width="160" height="200" rx="8" fill="url(#tftg)" />
                <text x="320" y="100" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                  TFT Display
                </text>
                <text x="320" y="125" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="11">
                  ILI9341
                </text>
                <text x="320" y="150" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="10">
                  2.8″ 240×320
                </text>
                <rect x="260" y="170" width="120" height="70" rx="4" fill="#000" opacity="0.5" />
                <text x="320" y="205" textAnchor="middle" fill="#81C784" fontSize="10">
                  SPI (HSPI)
                </text>
                {/* Touch */}
                <rect x="460" y="100" width="140" height="120" rx="8" fill="url(#touchg)" />
                <text x="530" y="135" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                  Touch
                </text>
                <text x="530" y="158" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="11">
                  XPT2046 / CST816
                </text>
                <text x="530" y="182" textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize="10">
                  SPI or I2C
                </text>
                {/* Peripherals */}
                <rect x="240" y="280" width="80" height="36" rx="6" fill="#4A148C" />
                <text x="280" y="302" textAnchor="middle" fill="white" fontSize="10">RGB LED</text>
                <rect x="340" y="280" width="80" height="36" rx="6" fill="#004D40" />
                <text x="380" y="302" textAnchor="middle" fill="white" fontSize="10">microSD</text>
                <rect x="440" y="280" width="80" height="36" rx="6" fill="#E65100" />
                <text x="480" y="302" textAnchor="middle" fill="white" fontSize="10">LDR</text>
                {/* Arrows */}
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
            <p className="text-sm text-gray-500 mt-2">
              ESP32 drives the display over SPI (HSPI) and reads touch via SPI (XPT2046) or I2C
              (CST816 depending on variant). RGB LED, microSD, and LDR are optional peripherals.
            </p>
          </section>

          {/* Component table */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Component Breakdown</h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 font-semibold text-gray-900">Component</th>
                    <th className="px-4 py-3 font-semibold text-gray-900">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-800">Board</td>
                    <td className="px-4 py-3">
                      ESP32-2432S028 (<CydLink>CYD</CydLink>). Get the <strong>USB-C</strong> version
                      for modern cables and case compatibility.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-800">MCU</td>
                    <td className="px-4 py-3">
                      ESP32-WROOM-32 (dual-core 240 MHz, WiFi 802.11 b/g/n, Bluetooth 4.2).
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-800">Display</td>
                    <td className="px-4 py-3">
                      ILI9341 2.8″ TFT, 240×320 RGB, 18-bit colour, SPI (HSPI). Backlight typically
                      GPIO 21 or 27.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-800">Touch</td>
                    <td className="px-4 py-3">
                      XPT2046 (resistive, SPI) on most boards; some variants use CST816 (capacitive,
                      I2C). Check your board label.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-800">RGB LED</td>
                    <td className="px-4 py-3">
                      Red GPIO 4, Green GPIO 16, Blue GPIO 17 (active low). Can show status at a
                      glance.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-800">microSD</td>
                    <td className="px-4 py-3">Optional slot for logging or assets (e.g. fonts).</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-800">LDR</td>
                    <td className="px-4 py-3">
                      Light-dependent resistor for automatic backlight dimming in software.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Pinout */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Pinout Reference</h2>
            <p className="leading-relaxed mb-4">
              Pin assignments can vary slightly by manufacturer and revision. The config generator
              on this site offers presets for common variants (SPI touch / I2C touch). Typical
              values:
            </p>
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 font-semibold text-gray-900">Function</th>
                    <th className="px-4 py-3 font-semibold text-gray-900">GPIO</th>
                    <th className="px-4 py-3 font-semibold text-gray-900">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-4 py-2 font-medium">TFT CLK</td>
                    <td className="px-4 py-2 font-mono">14</td>
                    <td className="px-4 py-2">HSPI SCK</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">TFT MOSI</td>
                    <td className="px-4 py-2 font-mono">13</td>
                    <td className="px-4 py-2">HSPI MOSI</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">TFT MISO</td>
                    <td className="px-4 py-2 font-mono">12</td>
                    <td className="px-4 py-2">HSPI MISO (optional)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">TFT CS</td>
                    <td className="px-4 py-2 font-mono">15</td>
                    <td className="px-4 py-2">Chip select</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">TFT DC / RS</td>
                    <td className="px-4 py-2 font-mono">2</td>
                    <td className="px-4 py-2">Data/command</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Backlight</td>
                    <td className="px-4 py-2 font-mono">21</td>
                    <td className="px-4 py-2">Or 27 on some I2C touch boards</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Touch (XPT2046)</td>
                    <td className="px-4 py-2 font-mono">—</td>
                    <td className="px-4 py-2">Shares HSPI; separate CS (e.g. 33)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">Touch (CST816 I2C)</td>
                    <td className="px-4 py-2 font-mono">SDA 18, SCL 19</td>
                    <td className="px-4 py-2">I2C touch variant</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-medium">RGB LED R / G / B</td>
                    <td className="px-4 py-2 font-mono">4, 16, 17</td>
                    <td className="px-4 py-2">Active low</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Software stack diagram */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Software Stack</h2>
            <p className="leading-relaxed mb-4">
              With <strong>ESPHome</strong> and <strong>LVGL</strong>, the <CydLink>CYD</CydLink>{' '}
              can run a rich UI (clocks, sensor tiles, dashboards) and talk to Home Assistant over
              the native API. Data flow:
            </p>
            <div className="rounded-xl border border-gray-200 bg-white p-6 overflow-x-auto">
              <svg
                viewBox="0 0 560 200"
                className="w-full max-w-2xl mx-auto h-auto"
                aria-label="Software stack and data flow"
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
                  Sensors & state → HA → ESPHome → CYD screen
                </text>
              </svg>
            </div>
          </section>

          {/* Use cases */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Typical Use Cases</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Home Assistant monitor</strong> — Clock, date, and 6–8 entity tiles (doors,
                motion, energy, temperature) with colour-coded status. This site’s config generator
                targets this layout.
              </li>
              <li>
                <strong>Smart home control panel</strong> — Buttons and switches to control lights,
                scenes, and automations via HA.
              </li>
              <li>
                <strong>Weather / info dashboard</strong> — Forecast, calendar, or RSS feed
                displayed on the <CydLink>CYD</CydLink>.
              </li>
              <li>
                <strong>Prototyping</strong> — LVGL demos, custom UIs, or learning ESP32 + display
                without separate wiring.
              </li>
            </ul>
          </section>

          {/* References */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Reference Links</h2>
            <p className="leading-relaxed mb-4">
              Official docs, community projects, and where to <CydLink>buy the CYD</CydLink>.
            </p>
            <ul className="space-y-3">
              <li>
                <a
                  href={BUY_NOW_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 hover:text-amber-700 font-medium underline underline-offset-2"
                >
                  Buy CYD on Amazon (affiliate)
                </a>
                {' '}
                — 2.8″ ILI9341 CYD board (USB-C). Affiliate link; supports this project.
              </li>
              <li>
                <a
                  href="https://esphome.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  ESPHome
                </a>
                {' '}
                — Firmware and YAML-based configuration for ESP devices.
              </li>
              <li>
                <a
                  href="https://esphome.io/components/display/ili9341.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  ESPHome ILI9341 display
                </a>
                {' '}
                — Official display component docs.
              </li>
              <li>
                <a
                  href="https://www.home-assistant.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Home Assistant
                </a>
                {' '}
                — Open-source home automation; entities feed the CYD dashboard.
              </li>
              <li>
                <a
                  href="https://github.com/element-software/CYD-ESPHome-HA-Monitor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  CYD-ESPHome-HA-Monitor (GitHub)
                </a>
                {' '}
                — This project: HAMon config and YAML generator.
              </li>
              <li>
                <a
                  href="https://github.com/drrcastro/CYD-Smart-Dashboard-for-Home-Assistant"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  CYD Smart Dashboard (drrcastro)
                </a>
                {' '}
                — Community inspiration for CYD + HA dashboards.
              </li>
              <li>
                <a
                  href="https://docs.espressif.com/projects/esp-idf/en/latest/esp32/hw-reference/esp32/get-started-devkitc.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  ESP32 (Espressif)
                </a>
                {' '}
                — MCU reference from Espressif.
              </li>
              <li>
                <a
                  href="https://www.buydisplay.com/download/ic/ILI9341.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  ILI9341 datasheet
                </a>
                {' '}
                — TFT controller reference (external PDF).
              </li>
            </ul>
          </section>

          {/* CTA */}
          <section className="rounded-xl bg-white border border-gray-200 p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Ready to configure your CYD?</h2>
            <p className="text-gray-700 mb-4">
              Use the <strong>Config Generator</strong> to build your ESPHome YAML visually — no
              need to edit YAML by hand. Pick sensors, GPIO presets, and copy the result into
              ESPHome.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/config-generator"
                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-sm hover:bg-amber-400 transition-colors"
              >
                Open Config Generator
                <span aria-hidden>→</span>
              </Link>
              <a
                href={BUY_NOW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-amber-500 px-5 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
              >
                Buy CYD on Amazon
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
