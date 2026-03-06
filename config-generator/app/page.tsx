import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero banner: 90vh with CYD background */}
      <header
        className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 text-center overflow-hidden"
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
          <div className="absolute inset-0 bg-black/70 z-[1]" aria-hidden />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-lg">
            Cheap Yellow Display (CYD)
          </h1>
          <p className="text-xl md:text-2xl text-amber-100/95 drop-shadow-md">
            Configuration tools and information for the ESP32-2432S028
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {/* What is a CYD */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">What is a CYD?</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            The <strong>Cheap Yellow Display</strong> (CYD) is the popular name for the <strong>ESP32-2432S028</strong> — an all-in-one development board that combines an ESP32 microcontroller with a 2.8″ colour TFT touchscreen (240×320), resistive touch (XPT2046 or CST816 on some variants), and useful extras like an onboard RGB LED, microSD slot, and LDR. It’s become a favourite in the maker and smart-home community for building compact dashboards, status displays, and control panels without wiring a separate screen.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Because the display and ESP32 are on one board, you can build a full GUI device (e.g. a Home Assistant monitor) by flashing firmware and connecting to Wi‑Fi — no soldering or complex wiring required.
          </p>
        </section>

        {/* Purpose of this website */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Purpose of this website</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            This site exists to help you get the most out of your CYD when using <strong>ESPHome</strong> and (optionally) <strong>Home Assistant</strong>. Rather than editing YAML by hand, you can use the tools here to generate and customise configurations visually, then copy the result into ESPHome and flash your device.
          </p>
          <p className="text-gray-700 leading-relaxed">
            The project supports a <strong>Home Assistant monitor</strong> (sensor dashboard with clock), tailored for the CYD’s screen and GPIO layout.
          </p>
        </section>

        {/* CYD information */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">CYD at a glance</h2>
          <ul className="space-y-2 text-gray-700">
            <li><strong>Board:</strong> ESP32-WROOM-32, 2.8″ ILI9341 TFT (240×320), SPI touch</li>
            <li><strong>Display pins:</strong> TFT on HSPI (e.g. CLK 14, MOSI 13, MISO 12, CS 15, DC 2); backlight often GPIO 21 (or 27 on I2C touch variants)</li>
            <li><strong>Onboard RGB LED:</strong> Red GPIO 4, Green GPIO 16, Blue GPIO 17 (active low)</li>
            <li><strong>Typical use:</strong> ESPHome + LVGL for dashboards, clocks, sensor tiles, and custom UIs</li>
          </ul>
          <p className="text-sm text-gray-500 mt-3">
            Pinouts can vary slightly by manufacturer and revision; the config generator offers presets for common variants (SPI touch / I2C touch) and optional custom pins.
          </p>
        </section>

        {/* Config generator CTA */}
        <section className="mb-12 rounded-xl bg-white border border-gray-200 p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Config Generator</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The <strong>Config Generator</strong> is a web app that lets you build your CYD configuration without touching YAML. You pick your sensors, set device and GPIO options, and get a complete ESPHome YAML file to paste into your ESPHome device. It reduces errors, keeps pinouts and substitutions consistent, and gives you a live preview of the layout. Copy the generated YAML in one click for flashing via ESPHome.
          </p>
          <Link
            href="/config-generator"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-base font-semibold text-gray-900 shadow-sm hover:bg-amber-400 transition-colors"
          >
            Open Config Generator
            <span aria-hidden>→</span>
          </Link>
        </section>
      </div>
    </main>
  );
}
