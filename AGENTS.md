# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

This repo contains two parts:

1. **`ha-monitor.yaml`** — ESPHome firmware config for the ESP32-2432S028 (CYD). Not buildable without physical hardware + Home Assistant.
2. **`config-generator/`** — A Next.js 16 static-export web app (YAML config generator). This is the only locally runnable service.

### Running the config generator

All commands are run from the `config-generator/` directory. See `package.json` for the full script list.

- **Dev server:** `npm run dev` (serves on port 3000)
- **Build:** `npm run build` (static export to `out/`)
- **Generate icons:** `npm run generate:icons` (fetches Material icon codepoints from GitHub — requires network)

### Known issues

- **Lint is broken:** `npm run lint` runs `next lint`, but Next.js 16 removed the `lint` subcommand, and ESLint 10 no longer supports the legacy `.eslintrc.json` format. The CI workflow does not run lint. To lint, the project would need migration to ESLint flat config (`eslint.config.js`).

### Gotchas

- `next.config.js` uses `output: 'export'` for static site generation. There is no server-side rendering.
- `basePath` and `assetPrefix` are set from `PAGES_BASE_PATH` env var (used in GitHub Pages CI). Locally, these default to empty strings, so the app is served at `/`.
- Node.js 22 is required (matches CI).
