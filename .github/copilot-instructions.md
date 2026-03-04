# Copilot Instructions for CYD-ESPHome-HA-Monitor

## Project Overview

**HAMon** is a Home Assistant sensor dashboard for the **ESP32-2432S028** ("Cheap Yellow Display" / CYD), built with ESPHome and LVGL. It displays up to 8 Home Assistant entities (binary sensors and numeric sensors) with dynamic colour-coded icons and an optional clock.

The repository has two main parts:

1. **`ha-monitor.yaml`** — the ESPHome YAML configuration flashed to the CYD device.
2. **`config-generator/`** — a Next.js web app (deployed to GitHub Pages) that lets users visually configure their dashboard and generate the YAML without editing files manually.

## Repository Structure

```
.
├── ha-monitor.yaml          # ESPHome device configuration
├── secrets.yaml             # ESPHome secrets template
└── config-generator/        # Next.js YAML config generator web app
    ├── app/                 # Next.js App Router pages and layout
    ├── components/          # React UI components
    ├── lib/                 # Business logic
    │   ├── yamlGenerator/   # Modules that build the ESPHome YAML output
    │   ├── defaultConfig.ts # Default sensor configuration
    │   ├── devicePresets.ts # GPIO pin presets for board variants
    │   ├── colorUtils.ts    # Colour helpers
    │   └── icons.ts         # Icon set helpers
    ├── types/
    │   └── config.ts        # TypeScript types for all config data
    ├── public/              # Static assets
    ├── next.config.js       # Next.js config (static export)
    └── package.json
```

## Config Generator Tech Stack

- **Next.js 16** with App Router and static export (`output: 'export'`), deployed to GitHub Pages
- **React 19**, **TypeScript 5**
- **Tailwind CSS v4** (PostCSS)
- No test framework is currently configured

## Development Setup (config-generator)

```bash
cd config-generator
npm install
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build → out/
npm run lint         # ESLint
```

The app is served at `https://cheapyellowdisplay.co.uk/` (GitHub Pages). The `PAGES_BASE_PATH` env var sets `basePath` and `assetPrefix` for subdirectory hosting.

## Key TypeScript Types (`types/config.ts`)

Four sensor types form a discriminated union (`SensorConfig`):

| Type | Description |
|------|-------------|
| `"binary"` | Binary sensor (e.g. door open/closed) — uses `iconOn`/`iconOff`, `colorOn`/`colorOff` |
| `"sensor"` | Numeric sensor (e.g. energy, temperature) — uses `icon`, `iconColor`, `format`, threshold colours |
| `"light"` | Light entity — uses `iconOn`/`iconOff`, `colorOn`/`colorOff` |
| `"switch"` | Switch entity — uses `iconOn`/`iconOff`, `colorOn`/`colorOff` |

Sensor slot IDs follow a grid layout: `r1c1`, `r1c2`, `r2c1`, `r2c2`, `r3c1`, `r3c2`, `r4c1`, `r4c2`. With the clock visible, only the first 6 slots are used; with the clock hidden, all 8 are available.

```ts
// Example: checking sensor type safely
if (sensor.type === 'sensor') {
  // NumericSensorConfig — has .format, .colorThreshHigh, etc.
}
```

## YAML Generation (`lib/yamlGenerator/`)

The YAML is assembled from composable modules:

- `header.ts` — MIT license comment header
- `substitutions.ts` — ESPHome `substitutions:` block (per-sensor values)
- `boilerplate.ts` — ESPHome core config (wifi, api, ota, display SPI, etc.)
- `lvgl.ts` — LVGL screen layout (clock, sensor grid)
- `numericSensors.ts` — `sensor:` platform entries for numeric sensors
- `onOffSensors.ts` — `binary_sensor:` and `switch:` platform entries
- `light.ts` — `light:` platform entries

The entry point is `lib/yamlGenerator/index.ts → generateYaml(config: ConfigData)`.

## Colour Format

Colours are **ESPHome hex strings** of the form `0xRRGGBB` (e.g. `0xFF5252`), **not** CSS `#RRGGBB`. Always use this format in generated YAML, default configs, and when storing colour values in `ConfigData`.

Common colours:
- Red: `0xFF5252` — alert / open
- Green: `0x32CD32` — OK / closed
- Orange: `0xFFA500` — warning
- Blue: `0x00BFFF` — cold / info
- Grey: `0x888888` — inactive / default

## Icon Sets

Two icon sets are supported (selected in the UI via `iconSet` in `ConfigData`):

- **`material_design_icons`** (default) — community icon set
- **`material_symbols`** — Google's official set ([fonts.google.com/icons](https://fonts.google.com/icons))

Icons are stored as Unicode escape sequences (e.g. `\uea0b`). The `icon_glyphs` substitution must list each **unique** codepoint once to avoid ESPHome "duplicate glyph" errors.

## Device Variants

Three board variants are supported (`DeviceVariant`):

- `spi_touch` — standard CYD with XPT2046 resistive touch, backlight GPIO21
- `i2c_touch` — CYD variant with CST816 I2C touch, backlight GPIO27
- `custom` — user-defined GPIO pins

GPIO pin sets are defined in `lib/devicePresets.ts`. Always use `getEffectivePins(config)` to retrieve the pins to use for YAML generation.

## React Component Conventions

- **Modals** use the native `<dialog>` HTML element, with two `useEffect` hooks: one to call `showModal()`/`close()` and one to attach/detach a `'close'` event listener for cleanup. See `components/DisplaySettingsModal.tsx` as a reference.
- **UI preview scaling** uses container query units (`cqmin`). The ESPHome clock font is 48 px ≈ 16 cqmin (1 cqmin ≈ 3 ESPHome pixels). See `components/CydScreenGrid.tsx` and `components/CydClock.tsx`.
- Use the `@/` TypeScript path alias for imports from the `config-generator/` root (e.g. `@/types/config`, `@/lib/defaultConfig`).
- Follow existing patterns: functional components with TypeScript, Tailwind CSS utility classes, no separate CSS modules.

## ESPHome YAML Conventions

- All user-facing customisation lives in the `substitutions:` block — no hardcoded values in the automation/display code below.
- Sensor slot substitution keys follow the pattern `<id>_<field>` (e.g. `r1c1_entity`, `r1c2_color_on`).
- Numeric sensor threshold colours use the keys `r<n>c<n>_color_thresh_high/mid/low` for threshold values and `r<n>c<n>_color_high/mid/low` for the corresponding colours.
- Do not introduce breaking changes to the `substitutions:` key names — existing user configs depend on them.
