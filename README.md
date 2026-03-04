# Coveo Commerce Troubleshoot Console

Standalone Vite + Vanilla TypeScript troubleshoot console for Coveo Commerce, now with a reusable deploy service package.

## Overview

The repository has two main parts:

1. App UI (`src/`) for local dev and hosted UI rendering.
2. Service package (`packages/commerce-troubleshoot-deployer/`) that handles:
- runtime config generation
- deterministic hosted bundle assembly
- deploy config generation
- managed or provided access token resolution
- hosted deployment orchestration

Phase 4 CLI adapter work stays out of this repo.

## Repository Layout

```text
src/
scripts/
packages/
  commerce-troubleshoot-deployer/
    src/
    assets/template/
hosted-local/
tests/unit/deployer/
```

## Build Scripts: Which One to Use

- `npm run build`
Builds only the Vite app (`dist/`).
Use for frontend-only changes.

- `npm run build:service`
Builds only the deployer package TypeScript output.
Use for service-code-only changes.

- `npm run build:service:artifact`
Builds app + regenerates deterministic service template assets under `packages/commerce-troubleshoot-deployer/assets/template`.
Use when UI bundle content changed.

- `npm run build:service:prepare`
Runs `build:service:artifact` then `build:service`.
Use when you want full service readiness.

- `npm run build:hosted`
Runs full service preparation and service dry-run packaging into:
- `dist/bundle`
- `coveo.deploy.json`
No `ui:deploy` call.

- `npm run deploy:hosted`
Runs full flow including `coveo ui:deploy`.

## Common Validation Scenarios

### 1) Frontend-only validation

```bash
npm run build
npm run test
npm run lint
```

### 2) Service-only validation

```bash
npm run build:service
npm run test:service
npm run lint
```

### 3) Hosted dry-run with provided keys

```bash
APP_ORGANIZATION_ID=<org> \
APP_PLATFORM_ACCESS_TOKEN=<platform_oauth_token> \
APP_HOSTED_PAGE_NAME=<page_name> \
APP_ENGINE_ACCESS_TOKEN=<engine_api_key> \
APP_CMH_ACCESS_TOKEN=<cmh_api_key> \
npm run build:hosted
```

Expected outputs:
- `dist/bundle/troubleshoot.html`
- `dist/bundle/js/runtime-config.js`
- `dist/bundle/js/app.js`
- `dist/bundle/styles/main.css`
- `coveo.deploy.json`

### 4) Managed-key path from scratch

1. Ensure CLI auth exists:

```bash
coveo auth:login
```

2. Remove or unset these env vars:
- `APP_ENGINE_ACCESS_TOKEN`
- `APP_CMH_ACCESS_TOKEN`
- `APP_PLATFORM_ACCESS_TOKEN` (or `APP_ACCESS_TOKEN`)
- optional: `APP_ORGANIZATION_ID` (if you want org from CLI config)

3. Run:

```bash
npm run build:hosted -- --page-name <page_name>
```

This exercises managed-key resolution/reuse (`ctc-engine-<org>`, `ctc-cmh-<org>`).

Managed token values are cached locally in `.cache/managed-keys.json` so subsequent runs can reuse the same managed keys even when API key list/get responses return masked values.

### 5) Real hosted deploy

```bash
npm run deploy:hosted -- --page-name <page_name>
```

When `--page-id` is omitted, the service now resolves an existing hosted page by exact `--page-name` and forwards that ID to `coveo ui:deploy` to perform an update.
If no exact name match exists, deployment creates a new hosted page.
Lookup strategy:
- Primary endpoint: `GET /rest/organizations/{orgId}/hostedpages/projects/pages?order=asc&perPage=100&page=<n>`
- Fallback endpoint (if primary is unavailable): `GET /rest/organizations/{orgId}/pages?name=<pageName>`
- Region host is derived from CLI/env region (`platform` / `platform-eu` / `platform-ca`).
- `404 Page with name ... does not exist` on fallback is treated as non-fatal (no match), allowing create flow.

Optional managed-key rotation:

```bash
npm run deploy:hosted -- --page-name <page_name> --rotate
```

`--rotate` forces new managed key creation and updates `.cache/managed-keys.json`.

### 6) Hosted-local harness

```bash
npm run prepare:hosted:local
npm run hosted:local
```

Then open:
- `http://127.0.0.1:4173/index.html`

## Deploy Inputs Resolution

Wrapper scripts resolve values in this order:

1. CLI args
2. environment variables
3. `coveo config:get` (organization/accessToken/region/environment)

Supported args/env:

- `--organization` / `APP_ORGANIZATION_ID`
- `--access-token` / `APP_PLATFORM_ACCESS_TOKEN`
- `--page-name` / `APP_HOSTED_PAGE_NAME`
- `--page-id` / `APP_HOSTED_PAGE_ID`
- `--engine-token` / `APP_ENGINE_ACCESS_TOKEN`
- `--cmh-token` / `APP_CMH_ACCESS_TOKEN`
- `--tracking-id` / `APP_DEFAULT_TRACKING_ID`
- `--language` / `APP_DEFAULT_LANGUAGE`
- `--country` / `APP_DEFAULT_COUNTRY`
- `--currency` / `APP_DEFAULT_CURRENCY`
- `--view-url` / `APP_DEFAULT_VIEW_URL`
- `--rotate` (managed strategy only)

If engine/cmh tokens are not provided, the service uses managed-key mode.

`--tracking-id` only sets runtime defaults for the hosted app payload. It does not change hosted page identity (`--page-name`) and does not alter key strategy selection.

## Consuming the Deployer Service

Exports come from:
- `packages/commerce-troubleshoot-deployer/src/index.ts`

Primary API:
- `deployTroubleshootConsole(request, options?)`

Also useful:
- `resolveRuntimeConfigForRequest(request, options?)`
- `resolveAccessTokens(...)`
- `createDeployConfig(...)`

### A) Consume from this repo (local workspace)

1. Build service package:

```bash
npm run build:service
```

2. Import from built dist in a Node ESM script:

```ts
import {deployTroubleshootConsole} from './packages/commerce-troubleshoot-deployer/dist/index.js';

const result = await deployTroubleshootConsole(
  {
    target: {
      organizationId: 'my-org',
      hostedPageName: 'commerce-troubleshoot-console',
    },
    auth: {
      accessToken: process.env.COVEO_ACCESS_TOKEN ?? '',
    },
    keyStrategy: {
      mode: 'managed',
    },
    deploy: {
      dryRun: true,
      outputRootDir: process.cwd(),
      bundleRelativeDir: 'dist/bundle',
      deployConfigRelativePath: 'coveo.deploy.json',
    },
  },
  {
    logger: console.log,
  }
);

console.log(result);
```

### B) Consume as package (once published)

```ts
import {deployTroubleshootConsole} from '@coveops/commerce-troubleshoot-deployer';
```

Use the same request shape as above.

## Publishing Deployer Package

### Manual publish to npmjs

```bash
npm run build --workspace @coveops/commerce-troubleshoot-deployer
npm publish --workspace @coveops/commerce-troubleshoot-deployer --access public
```

### Automated publish on `main`

- Workflow: `.github/workflows/publish-deployer.yml`
- Trigger: pushes to `main` that touch `packages/commerce-troubleshoot-deployer/**`
- Auth: npm trusted publishing via GitHub OIDC (no long-lived `NPM_TOKEN` secret)
- Guardrail: workflow checks whether `package.json` version is already published; if yes, it skips publish

#### Configure npm trusted publisher

On npmjs.com for package `@coveops/commerce-troubleshoot-deployer`:

- Select provider: GitHub Actions
- Organization or user: your GitHub org/user that owns this repo
- Repository: `coveo-commerce-troubleshoot-console`
- Workflow filename: `publish-deployer.yml` (filename only, no path)
- Environment name: leave empty unless you add a GitHub Environment gate

Notes:
- Trusted publishing supports GitHub-hosted runners only.
- npm trusted publishing currently requires Node `22.14+` / npm `11.5.1+` in CI (workflow uses Node `24`).
- If the package has never been published, perform a one-time manual publish first, then attach the trusted publisher in npm package settings.

When shipping a new deployer release, bump `packages/commerce-troubleshoot-deployer/package.json` version before merging to `main`.

## Key Notes

- Keep `src/app/runtime-config.generated.ts` sanitized in git; it is generated at runtime/script time.
- Service templates in `assets/template` are deterministic generated artifacts, refreshed by `npm run build:service:artifact`.
- No CLI adapter logic should be added to this repo for phase 4.
