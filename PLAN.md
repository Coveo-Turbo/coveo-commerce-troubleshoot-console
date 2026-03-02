# Vite-Based Generic Coveo Commerce Troubleshoot Console Repository Plan

## Summary
Create a new standalone repository dedicated to a generic Commerce Troubleshoot Console that can be deployed to any Coveo organization using profile-driven configuration and local `coveo ui:deploy` scripts.  
The repo will be built with **Vite + Vanilla TypeScript**, keep the current dynamic CMH-driven UX (tracking IDs/locales/listings + advanced context presets), and enforce a **two-token model**:
- `engineAccessToken` for commerce `/search` and `/listing` execution
- `cmhAccessToken` for CMH/discovery endpoints

No organization-specific logic will be hardcoded.

## Scope
1. Build a single-purpose troubleshoot app (no general site pages).
2. Support local development, hosted-page local harness, and hosted deploy packaging.
3. Make org switching deployment-ready through **profiles + CLI**, not code changes.
4. Keep advanced context presets persisted in browser storage.
5. Preserve current usability features (minimized top panel, listing filter search, conditional session fields, modal UX).

## Repository Architecture (Decision-Complete)

### 1. Tech Stack
1. Vite `vanilla-ts`
2. TypeScript strict mode
3. `@coveo/headless` (commerce)
4. `dotenv` for profile loading in Node scripts
5. `vitest` for unit tests
6. `playwright` for optional e2e smoke tests

### 2. Proposed File/Folder Layout
```text
coveo-commerce-troubleshoot-console/
  src/
    app/
      bootstrap.ts
      troubleshoot-page.ts
      troubleshoot-engine.ts
    services/
      cmh-config-service.ts
      config-loader.ts
    state/
      troubleshoot-state.ts
    styles/
      main.css
    templates/
      troubleshoot.html
    types/
      app-config.ts
      troubleshoot.ts
  scripts/
    build-hosted.mjs
    generate-deploy-config.mjs
    load-profile-env.mjs
    hosted-local-prepare.mjs
  profiles/
    examples/
      profile.example.env
  tests/
    unit/
      troubleshoot-state.test.ts
      cmh-config-service.test.ts
      config-loader.test.ts
  hosted-local/
    index.html
    code.js
    sandbox.html
  coveo.deploy.template.json
  package.json
  tsconfig.json
  vite.config.ts
  README.md
  .env.example
```

### 3. Profile-Driven Configuration Model
1. Deploy/build commands require `--profile <name>`.
2. Each profile is an env file, for example `profiles/<name>.env`.
3. Required profile keys:
- `APP_ORGANIZATION_ID`
- `APP_ENGINE_ACCESS_TOKEN`
- `APP_CMH_ACCESS_TOKEN`
- `APP_HOSTED_PAGE_NAME`
4. Optional profile keys:
- `APP_DEFAULT_TRACKING_ID`
- `APP_DEFAULT_LANGUAGE`
- `APP_DEFAULT_COUNTRY`
- `APP_DEFAULT_CURRENCY`
- `APP_DEFAULT_VIEW_URL`
- `APP_HOSTED_PAGE_ID` (for hosted-local harness)
5. Build-time config generation writes `window.__APP_CONFIG` into the built bundle input.
6. `config-loader.ts` validates config at runtime and fails fast with explicit errors.

### 4. Token Separation Rules (Hard Requirement)
1. `APP_ENGINE_ACCESS_TOKEN` is used only by commerce engine requests.
2. `APP_CMH_ACCESS_TOKEN` is used only by CMH/discovery service requests.
3. No automatic fallback from one token to the other.
4. If either token is missing, show explicit UI initialization error with which domain failed (`ENGINE` or `CMH`).

### 5. App Behavior to Port
1. Dynamic tracking ID discovery via:
- `GET /rest/organizations/{org}/trackingidcatalogmappings`
2. Listing discovery fallback via:
- `GET /rest/organizations/{org}/commerce/v2/configurations/listings`
- `GET /rest/organizations/{org}/commerce/v2/configurations/search`
- `GET /rest/organizations/{org}/commerce/v2/listings/pages`
3. Top controls:
- Tracking dropdown
- Locale dropdown
- Mode switch (`search` / `listing`)
- Listing filter input + dropdown (searchable)
- Advanced context preset selector
- Advanced context modal
- Manage context presets modal
- Reset button
- Minimize/expand control panel button (icon button)
4. Session panel behavior:
- In `search` mode: show search URL; hide listing URL/pill
- In `listing` mode: show listing URL/pill; hide search URL/pill
5. Persistent state:
- selected tracking/locale/mode/listing
- top panel minimized flag
- advanced context + context presets
6. Storage must handle sandboxed environments where localStorage is unavailable.

### 6. Hosted Compatibility Rules
1. Bootstrapping waits for injected hosted markup (poll + timeout).
2. Root-scoped DOM querying (supports document root and hosted shadow-root context).
3. CSS must be rooted to `[data-template='troubleshoot']` / `.troubleshoot-root`, not only `body[data-template=...]`.
4. Hosted package generation outputs:
- `dist/bundle/troubleshoot.html` (body markup only, scripts stripped)
- `dist/bundle/js/<single-main>.js`
- `dist/bundle/styles/main.css`
- `coveo.deploy.json`
5. `coveo.deploy.json` includes:
- Atomic JS URL
- Atomic theme CSS URL
- Google Fonts URL (Space Grotesk + IBM Plex Mono)
- Single JS entry file with `isModule: true`

### 7. NPM Scripts (Exact Contract)
1. `dev`: start Vite dev server
2. `build`: production build
3. `build:hosted -- --profile <name>`: build + hosted bundle transform + deploy config generation
4. `deploy:hosted -- --profile <name>`: run hosted build then `coveo ui:deploy --config coveo.deploy.json`
5. `prepare:hosted:local -- --profile <name>`: generate hosted-local env and assets
6. `hosted:local -- --profile <name>`: serve hosted-local harness
7. `test`: run vitest
8. `test:e2e`: run playwright smoke tests
9. `lint`: eslint + typecheck

## Public APIs / Interfaces / Types

### 1. `AppRuntimeConfig`
```ts
type AppRuntimeConfig = {
  organizationId: string;
  engineAccessToken: string;
  cmhAccessToken: string;
  hostedPageName: string;
  defaults: {
    trackingId?: string;
    language: string;
    country: string;
    currency: string;
    viewUrl: string;
  };
};
```

### 2. `TroubleshootState`
```ts
type TroubleshootState = {
  mode: 'search' | 'listing';
  selectedTrackingId: string;
  selectedLocaleId: string;
  selectedListingId: string;
  selectedContextPresetId: string;
  isTopPanelMinimized: boolean;
  advancedContext: AdvancedContext;
};
```

### 3. `AdvancedContext`
```ts
type AdvancedContext = {
  custom: Record<string, unknown>;
  dictionaryFieldContext: Record<string, unknown>;
};
```

### 4. `ContextPreset`
```ts
type ContextPreset = {
  id: string;
  label: string;
  advancedContext: AdvancedContext;
};
```

### 5. `TrackingData`
```ts
type TrackingData = {
  trackingId: string;
  locales: Array<{
    id: string;
    label: string;
    language: string;
    country: string;
    currency: string;
    viewUrl: string;
  }>;
  listings: Array<{
    id: string;
    label: string;
    url: string;
  }>;
};
```

## Implementation Plan (Phased)

### Phase 1: Scaffold and Configuration Foundation
1. Initialize Vite vanilla TS repo and base tooling.
2. Add profile loading scripts and env schema validation.
3. Add runtime config loader with hard token separation.
4. Add baseline troubleshoot template and root-scoped styling skeleton.

### Phase 2: Core Services and State
1. Implement CMH config service with tracking/locales/listings resolution.
2. Implement state/persistence module with safe storage access.
3. Implement troubleshoot engine factory with preprocess merge for `dictionaryFieldContext`.
4. Add strict validation and normalization for presets/state.

### Phase 3: UI and UX Behavior
1. Build control panel + session summary + interface shell.
2. Implement mode switching, listing filtering, and live apply behavior.
3. Implement advanced context modal and presets management modal.
4. Implement minimize/expand behavior and conditional session fields.

### Phase 4: Hosted Build/Deploy Pipeline
1. Implement hosted bundle transform script.
2. Generate deterministic `coveo.deploy.json` from profile + template.
3. Add local hosted harness scripts for reproducible hosted behavior.
4. Add deploy command wrappers around `coveo ui:deploy`.

### Phase 5: Verification and Documentation
1. Add unit tests for config/state/CMH parsing and fallback logic.
2. Add e2e smoke tests for hosted-local bootstrap + core interactions.
3. Write README with profile setup, local run, hosted-local run, deploy runbook, and troubleshooting matrix.

## Test Cases and Scenarios

1. **Config validation**
- Missing `APP_ENGINE_ACCESS_TOKEN` blocks engine init with explicit error.
- Missing `APP_CMH_ACCESS_TOKEN` blocks CMH discovery with explicit error.

2. **Token separation**
- Engine requests send `APP_ENGINE_ACCESS_TOKEN`.
- CMH requests send `APP_CMH_ACCESS_TOKEN`.
- No cross-token fallback occurs.

3. **Bootstrap in hosted context**
- `atomic-hosted-ui` injected markup is detected.
- Troubleshoot initialization runs and first request executes.

4. **Tracking switch**
- Selecting another tracking ID refreshes locale/listing options and executes new request.

5. **Locale switch**
- Updates language/country/currency and search `view.url`.

6. **Mode switch**
- Search mode uses search URL context.
- Listing mode uses selected listing URL context.
- Session panel fields toggle correctly.

7. **Listing filter usability**
- Large listing set can be filtered by label/id/url.
- Selected listing remains stable across filter input changes.

8. **Advanced context**
- Valid JSON applies immediately.
- Invalid JSON is blocked with inline error.
- `dictionaryFieldContext` is merged into outgoing payload context.

9. **Context presets**
- Add/edit/remove presets.
- Persists across reload.
- Reset restores default preset/state.

10. **Sandbox resilience**
- App works when localStorage is inaccessible (no crashes).

11. **Hosted styling/fonts**
- Root-scoped troubleshoot styles apply in hosted page.
- Font fallbacks remain visually consistent if external fonts fail.

12. **Deploy output validity**
- `dist/bundle` contains required files and single JS entry.
- `coveo ui:deploy --config coveo.deploy.json` runs with no schema errors.

## Assumptions and Defaults

1. Repo will be standalone and purpose-built only for the troubleshoot console.
2. Package manager is `npm`.
3. Deployment is **local CLI first** (no CI deployment in initial version).
4. Configuration is **profiles + CLI** (not runtime org/token inputs in UI).
5. Authentication model is **strict two-token**.
6. Hosted page deployment targets Coveo Hosted UI via `coveo ui:deploy`.
7. CMH discovery uses `trackingidcatalogmappings` as primary locale source, with commerce-v2 fallback.
8. Advanced context is the only user-managed preset domain retained for phase 1.
9. No backend proxy is introduced in this initial repo; tokens are client-available by design.
10. Existing Trek-specific branding/content is removed; repository ships neutral/generic naming and defaults.
