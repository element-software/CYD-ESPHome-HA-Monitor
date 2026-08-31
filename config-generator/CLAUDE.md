# CLAUDE.md — CYD HAMon Config Generator

All development guidance for this app lives in `AGENTS.md` (tech stack, commands, architecture, feature recipes, conventions, testing, deploy). It is the single source of truth — follow it for any change in this directory.

@AGENTS.md

## Quick reference

```bash
npm run dev    # dev server → http://localhost:3000
npm test       # jest unit tests (lib/yamlGenerator/__tests__/) — must pass
npm run build  # static export to out/ — must succeed (catches TS errors)
npm run lint   # next lint
```

## Non-negotiables when developing here

1. **Data model first**: config shapes live in `types/config.ts`; `SensorConfig` is a discriminated union on `type`. Every `setConfig`/`generateYaml` goes through `migrateConfig()` — old localStorage/exported configs must keep working (deprecate, never break).
2. **YAML generator stays pure**: modules in `lib/yamlGenerator/` are side-effect-free string builders concatenated by `generateYaml()` in a fixed order (header → substitutions → images → boilerplate → lvgl → on/off sensors → light → text/numeric sensors). Changing output? Update the Jest tests in `lib/yamlGenerator/__tests__/`.
3. **i18n**: `messages/en.json` is the source of truth; new UI strings must be added to all 10 locale files (untranslated English is an acceptable stopgap).
4. **Static export**: no server runtime — no API routes, no server actions. State is client-side only (localStorage).
5. **Never edit `lib/icons.generated.ts`** by hand — regenerate with `npm run generate:icons`.
6. New UI must use explicit Tailwind `dark:` variants and be verified in both themes.
