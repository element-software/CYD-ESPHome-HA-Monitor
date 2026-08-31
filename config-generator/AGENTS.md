# AGENTS.md — CYD HAMon Config Generator

Guidance for LLM agents (and humans) developing features in this app. Read this before making changes.

## What this app is

A **statically-exported Next.js web app** that generates ESPHome YAML for the **HAMon** project — a Home Assistant sensor dashboard for the ESP32-2432S028 "Cheap Yellow Display" (CYD). Users configure device settings, screens, and sensor slots in the UI; the app emits a complete, flashable ESPHome YAML file.

- Lives in `config-generator/` inside the [CYD-ESPHome-HA-Monitor](https://github.com/element-software/CYD-ESPHome-HA-Monitor) repo (the repo root contains the hand-written reference `ha-monitor.yaml` and docs).
- Deployed to GitHub Pages via CI → served at <https://cheapyellowdisplay.co.uk/>.
- **There is no backend.** All state is client-side (localStorage). All YAML generation happens in the browser.

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | `output: 'export'` — fully static |
| UI | React 19, TypeScript (`strict: true`) | Path alias `@/*` → `./*` |
| Styling | Tailwind CSS v4 (PostCSS) | No `tailwind.config.js`; config lives in `app/globals.css` |
| i18n | next-intl v4 (client-side only) | 10 locales in `messages/*.json` |
| Tests | Jest 30 + ts-jest | Unit tests only, no component tests |
| Icons | `@material-design-icons/font` + Google Material Symbols | Data in auto-generated `lib/icons.generated.ts` |

## Commands

```bash
npm install            # install dependencies
npm run dev            # dev server at http://localhost:3000
npm run build          # static export → out/
npm test               # jest (must pass before considering work done)
npm run lint           # next lint
npm run generate:icons # regenerate lib/icons.generated.ts (fetches from GitHub)
npm run generate:og    # regenerate OG images into public/og/ (uses sharp)
```

Node 22 is used in CI. Type-check via `npx tsc --noEmit` (there is no dedicated script).

## Directory structure

```
config-generator/
├── app/                    # App Router routes (server page.tsx → client *Content component)
│   ├── page.tsx            # Home/landing page
│   ├── config-generator/   # The generator UI
│   ├── about-cyd/          # Static info page
│   ├── privacy-policy/
│   ├── layout.tsx          # Root layout: theme script, fonts, SiteHeader/Footer, LocaleProvider
│   └── globals.css         # Tailwind v4 import + dark-mode overrides
├── components/             # React components (nearly all 'use client')
├── lib/                    # Pure logic: config model, YAML generation, utils
│   ├── yamlGenerator/      # YAML string builders (+ __tests__/)
│   ├── icons.generated.ts  # AUTO-GENERATED — do not edit (see generate:icons)
│   └── ...
├── types/config.ts         # All config shapes — the single source of truth for the data model
├── messages/*.json         # Translations, one file per locale (en.json is source of truth)
├── scripts/*.mjs           # Build-time Node scripts (icon/OG generation)
├── i18n/request.ts         # Minimal next-intl config (prerender only; real i18n is client-side)
├── public/                 # Static assets (images, fonts, og/)
└── next.config.js          # output:'export', basePath from PAGES_BASE_PATH env
```

## Architecture

### Data model (`types/config.ts`)

`ConfigData` is the root object. Key shapes:

- `SensorConfig` — a **discriminated union** on `type`: `"sensor"` (numeric), `"text"`, `"binary"`, `"light"`, `"switch"`, `"input_boolean"`, `"action"`. Each variant has type-specific fields (e.g. numeric has `format` + `thresholds[]`; on/off types have `stateOn/Off`, `iconOn/Off`, `colorOn/Off`).
- `ScreenConfig` — one per dashboard page: `id` (`s1`…`s6`), `name`, theme colors, optional `backgroundImage`, and its `sensors`.
- `DevicePins` / `DeviceVariant` — GPIO map; `spi_touch` (XPT2046), `i2c_touch` (CST816), or `custom`. Presets in `lib/devicePresets.ts`.

**Slot model:** every screen has 8 fixed slots with ids `r1c1`…`r4c2` (4 rows × 2 cols). When the clock is shown (screen 1 only, `hideClock === false`), only the first 6 slots render. In generated YAML, sensor ids are **prefixed with the screen id**: `s1_r1c1`. Max screens: `MAX_SCREENS = 6` (`lib/defaultConfig.ts`).

### State flow

- `components/ConfigGeneratorClient.tsx` owns the single `ConfigData` state via `useLocalStorageConfig()` (hydrates from `localStorage['hamon-config']`, saves debounced 300 ms).
- All updates are **immutable and top-down**: children receive `{ config, onChange }` and call `onChange({ ...config, ...patch })`. There is no store/context for config.
- **Every `setConfig` call and every `generateYaml` call runs `migrateConfig()`** (`lib/migrateConfig.ts`), which normalises old saved configs (wraps legacy single-screen configs into `screens[]`, reindexes ids, keeps legacy top-level `sensors` in sync with `screens[0].sensors`). When you add a field, keep migration in mind — old localStorage/JSON configs must keep working.

### YAML generation pipeline (`lib/yamlGenerator/`)

`generateYaml(config)` in `index.ts` concatenates pure string builders **in this exact order**:

1. `header.ts` — comment banner (license, project info).
2. `substitutions.ts` — the `substitutions:` block: device names, deduped `icon_glyphs` string, per-screen theme colors, then per-sensor keys (type-specific).
3. `generateImageConfig` (inline in `index.ts`) — `image:` blocks for screen background images.
4. `boilerplate.ts` — `esphome:`, `esp32`, `logger`, `api`, `ota`, `wifi`, optional `web_server` v3, `spi:`/`i2c:` buses, `display:` (mipi_spi), `touchscreen:` (per variant), `font:` blocks, `time:` + clock lambda.
5. `lvgl.ts` — the `lvgl:` section: one page per screen, swipe navigation (only when >1 screen), clock labels, and one `button` widget per enabled slot with fixed x/y grid math.
6. `onOffSensors.ts` — `binary_sensor:` / `switch:` blocks with `on_state` lambdas.
7. `light.ts` — monochromatic backlight light.
8. `numericSensors.ts` — `text_sensor:` and `sensor:` blocks, including threshold color/icon lambdas. Exports `sortThresholdsDesc`.

Conventions here:

- Generators are **pure functions returning strings**; return `""` when a section has no content.
- Disabled slots (`enabled === false`) are omitted from YAML entirely.
- Icon codes are stored as literal `\uXXXX` escape strings; `lib/icons.ts` converts between formats (`iconCodeToHexEscape` etc.).
- Colors in config are CYD format `0xRRGGBB`; UI uses CSS `#RRGGBB`. Convert with `lib/colorUtils.ts` (`cssToCydColor`, `cydReadableColor`, …).

### i18n

- next-intl is used **client-side only** (static export). `components/LocaleProvider.tsx` statically imports all 10 `messages/*.json` files, detects locale from `localStorage['locale']` → `navigator.language` → `'en'`, and wraps the app in `NextIntlClientProvider`. `i18n/request.ts` exists only to satisfy the next-intl plugin during prerender.
- Components use `useTranslations('<namespace>')` from next-intl; rich text via `t.rich(...)`. Locales are registered in `lib/i18n.ts`.
- **`en.json` is the source of truth.** When adding UI strings, add the key to `en.json` and to every other locale file (untranslated English text is acceptable as a stopgap — missing keys throw next-intl errors at runtime).

### Pages pattern

Every route follows: **server `page.tsx`** (exports `metadata` via `buildPageMetadata()` from `lib/metadata.ts`) → renders a **client `*Content`/`*Client` component** holding the interactive/translated UI.

### Styling & dark mode

- Tailwind v4 via `@import "tailwindcss"` in `app/globals.css`. Dark mode is class-based (`@custom-variant dark`); `.dark` is toggled on `<html>` by an inline script in `app/layout.tsx` (localStorage `theme`, else `prefers-color-scheme`).
- Because much markup only has light-mode classes, `globals.css` contains `html.dark …` override rules. **New UI must use explicit `dark:` variants** and check both themes.
- Modals use the native `<dialog>` element with `showModal()` + a `close`-event → `onClose` effect (see `YamlModal`, `IconPicker`, `DeviceGpioModal` for the established pattern).
- The device preview scales with container queries (`cqmin` units) — keep that approach if touching `CydScreenGrid`/`CydDevicePreview`.

## How to develop features (recipes)

### Add a new sensor type

1. Add a variant interface to the `SensorConfig` union in `types/config.ts` (extend `BaseSensorConfig`, add a unique `type` literal).
2. Add a sample/default instance in `lib/defaultConfig.ts` if it should appear by default.
3. Update the UI: `components/SensorConfigPanel.tsx` (form fields per type) and `components/SensorList.tsx` / `ConfigForm.tsx` if the type needs picker options.
4. Update YAML generation: extend `generateSensorSubstitutions` in `lib/yamlGenerator/substitutions.ts`, add a section generator (or extend an existing one) and wire it into `generateYaml` in `lib/yamlGenerator/index.ts`. Check `collectUniqueIconGlyphs` covers the new type's icon fields.
5. Update the preview rendering in `components/CydScreenGrid.tsx` if the type displays differently.
6. Handle migration in `lib/migrateConfig.ts` if old configs could contain related legacy fields.
7. **Add tests** in `lib/yamlGenerator/__tests__/` (follow the existing suite pattern) and run `npm test`.
8. Add any new UI strings to all `messages/*.json` files.

### Add a device-level setting

1. Add the field to `ConfigData` in `types/config.ts` (make it optional with a documented default).
2. Surface it in `DeviceSettingsCard.tsx` (or `DeviceGpioModal` / `DisplaySettingsModal` for GPIO/display settings).
3. Consume it in the relevant `lib/yamlGenerator/*` module.
4. Provide the default in `lib/defaultConfig.ts`; consider `migrateConfig` backfill for old saved configs.
5. Add translations + tests.

### Change generated YAML output

- Edit the relevant module under `lib/yamlGenerator/`, then **update/extend the tests in `lib/yamlGenerator/__tests__/`**. Tests assert with `toContain` / `not.toContain` / `toMatch` on generated strings — no snapshots, no mocks.
- Keep the generated YAML valid ESPHome for the CYD target (ESP32, esp-idf, ILI9341 via mipi_spi). The hand-written `../ha-monitor.yaml` at repo root is the reference implementation of the device side.

### Add a locale

1. Add `messages/<locale>.json` (copy `en.json`, translate).
2. Register the locale in `lib/i18n.ts` (`locales`, `localeNames`).
3. Add the import + entry to the `allMessages` map in `components/LocaleProvider.tsx`.

### Regenerate icon data

`lib/icons.generated.ts` is **auto-generated — never edit it by hand**. Run `npm run generate:icons` (fetches codepoint files from `google/material-design-icons` on GitHub, merges MDI + Material Symbols by ligature name, assigns categories via regex rules in `scripts/generate-icons.mjs`).

## Conventions

- **TypeScript strict mode**; no `any` unless unavoidable. Types live in `types/`, logic in `lib/`, JSX in `components/`.
- Imports use the `@/` alias (`@/types/config`, `@/lib/…`, `@/components/…`).
- Naming: PascalCase `.tsx` for components, camelCase `.ts` for libs, tests in `__tests__/` beside the code they cover.
- Add `'use client'` to any component using hooks/interactivity. Only `app/**/page.tsx`, `layout.tsx`, and dumb presentational pieces stay server components.
- Keep functions small and pure where possible; the YAML generator must remain side-effect free.
- Minimal, focused diffs. Follow existing code style (2-space indent, single quotes in UI/libs, double quotes inside generated YAML strings as required by YAML).

## Testing requirements

- Run **`npm test`** after any change to `lib/` (especially `lib/yamlGenerator/`). All suites must pass.
- Run **`npm run build`** to verify the static export compiles (catches TS errors and prerender issues).
- Add a test file per feature area; existing suites (`thresholds`, `multiscreen`, `action`, `inputBoolean`, `textSensor`, `boilerplate`) show the fixture + `toContain` pattern to follow.
- There are no component/E2E tests — verify UI changes manually with `npm run dev` in both light and dark mode.

## Build & deploy

- `npm run build` produces a static export in `out/`. `next.config.js` sets `basePath`/`assetPrefix` from the `PAGES_BASE_PATH` env var (empty locally; set by CI).
- CI (`.github/workflows/nextjs.yml` at repo root): on push to `main` → `npm ci` + `npm run build` in `config-generator/` → deploys `config-generator/out` to GitHub Pages. **CI is the canonical deploy path.**
- `npm run deploy` (gh-pages branch push) is a legacy/manual path — prefer CI.

## Constraints & gotchas

- **Static export**: no API routes, no server actions, no runtime SSR, no `next/image` optimization. Everything dynamic happens client-side.
- **Backward compatibility is mandatory**: users have configs saved in localStorage and exported JSON files. Never remove/rename fields without keeping them as `@deprecated` + handling them in `migrateConfig`. Examples already in the model: legacy `colorThresh*` fields, top-level `backlightPin`, top-level `sensors`.
- `icon_glyphs` in the generated `substitutions:` must list each unique icon exactly once (duplicate glyphs break ESPHome font compilation) — always go through `collectUniqueIconGlyphs`.
- Respect slot limits: 8 slots/screen, 6 when the clock is visible on screen 1; screens capped at `MAX_SCREENS` (6).
- Background images are referenced by path (e.g. `images/bg.png`) and compiled into flash at ESPHome build time; the browser preview uses blob URLs via `lib/previewImageCache.ts`.
- Never commit `out/`, `.next/`, `node_modules/`, or the repo-root `secrets.yaml`.
