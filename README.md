# Coveo Commerce Troubleshoot Console

Standalone Vite + Vanilla TypeScript troubleshoot console for Coveo Commerce, with profile-driven configuration and strict token separation.

## Highlights

- Single-purpose troubleshoot UI for search/listing execution.
- Strict two-token model:
  - `engineAccessToken` is used only for `/commerce/v2/search` and `/commerce/v2/listing`.
  - `cmhAccessToken` is used only for CMH discovery endpoints.
- Profile-based build/deploy (`profiles/<name>.env`) with no org-specific code changes.
- Hosted-compatible bootstrap (poll + timeout + shadow-root support).
- Persistent mode/tracking/locale/listing/presets/minimized panel state.
- Safe storage fallback for sandboxed environments where `localStorage` is blocked.

## Project Layout

```text
src/
  app/
  services/
  state/
  styles/
  templates/
  types/
scripts/
profiles/
hosted-local/
tests/
```

## Profile Setup

1. Copy [`profiles/examples/profile.example.env`](/Users/jfallaire/Sources/PSInternal/coveo-commerce-troubleshoot-console/profiles/examples/profile.example.env) to `profiles/<name>.env`.
2. Fill required keys:
   - `APP_ORGANIZATION_ID`
   - `APP_ENGINE_ACCESS_TOKEN`
   - `APP_CMH_ACCESS_TOKEN`
   - `APP_HOSTED_PAGE_NAME`

## Commands

- `npm run dev`
- `npm run build`
- `npm run build:hosted -- --profile <name>`
- `npm run deploy:hosted -- --profile <name>`
- `npm run prepare:hosted:local -- --profile <name>`
- `npm run hosted:local -- --profile <name>`
- `npm run test`
- `npm run test:e2e`
- `npm run lint`

## Hosted Build Output

`npm run build:hosted -- --profile <name>` generates:

- `dist/bundle/troubleshoot.html` (body markup, scripts stripped)
- `dist/bundle/js/<single-main>.js`
- `dist/bundle/styles/main.css`
- `coveo.deploy.json`

Deploy uses:

- Atomic JS URL: `https://static.cloud.coveo.com/atomic/v3/atomic.esm.js`
- Atomic theme CSS URL: `https://static.cloud.coveo.com/atomic/v3/themes/coveo.css`
- Google Fonts URL with `Space Grotesk` and `IBM Plex Mono`

## Hosted Local Harness

Run:

```bash
npm run hosted:local -- --profile demo
```

Then open [http://127.0.0.1:4173/index.html](http://127.0.0.1:4173/index.html).

The harness injects troubleshoot markup into an `atomic-hosted-ui` shadow root to emulate hosted bootstrap behavior.

## Troubleshooting Matrix

- Missing `APP_ENGINE_ACCESS_TOKEN`: UI initialization error labeled `ENGINE`.
- Missing `APP_CMH_ACCESS_TOKEN`: UI initialization error labeled `CMH`.
- CMH discovery failure: app falls back to profile defaults and fallback endpoints.
- Invalid advanced context JSON: apply is blocked with inline error.
- `localStorage` blocked: state persistence falls back to in-memory storage without crashing.
