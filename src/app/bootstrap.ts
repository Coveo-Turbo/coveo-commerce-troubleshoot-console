import {ConfigDomainError, type AppRuntimeConfig} from '../types/app-config';
import type {TroubleshootState} from '../types/troubleshoot';
import {loadRuntimeConfig} from '../services/config-loader';
import {createTroubleshootStateStore, createDefaultPreset} from '../state/troubleshoot-state';
import {CmhConfigService} from '../services/cmh-config-service';
import {createTroubleshootEngine, preloadHeadlessCommerce} from './troubleshoot-engine';
import {TroubleshootPage} from './troubleshoot-page';

const POLL_INTERVAL_MS = 120;
const WAIT_TIMEOUT_MS = 10_000;

function wait(durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });
}

function findTroubleshootMountFromRoot(root: ParentNode): HTMLElement | null {
  const explicitTemplate = root.querySelector<HTMLElement>("[data-template='troubleshoot']");
  if (explicitTemplate) {
    return explicitTemplate;
  }

  return root.querySelector<HTMLElement>('.troubleshoot-root');
}

function collectCandidateRoots(): ParentNode[] {
  const roots: ParentNode[] = [document];
  const hostedUIs = [...document.querySelectorAll<HTMLElement>('atomic-hosted-ui')];

  for (const hostedUI of hostedUIs) {
    if (hostedUI.shadowRoot) {
      roots.push(hostedUI.shadowRoot);
    }
  }

  return roots;
}

async function waitForTroubleshootMount(): Promise<HTMLElement | null> {
  const deadline = Date.now() + WAIT_TIMEOUT_MS;

  while (Date.now() < deadline) {
    for (const root of collectCandidateRoots()) {
      const mount = findTroubleshootMountFromRoot(root);
      if (mount) {
        return mount;
      }
    }

    await wait(POLL_INTERVAL_MS);
  }

  return null;
}

function createFallbackMount(): HTMLElement {
  const fallback = document.createElement('div');
  fallback.dataset.template = 'troubleshoot';
  document.body.append(fallback);
  return fallback;
}

function getStateDefaults(config: AppRuntimeConfig): TroubleshootState {
  const localeId = `${config.defaults.language}-${config.defaults.country}-${config.defaults.currency}`.toLowerCase();

  return {
    mode: 'search',
    selectedTrackingId: config.defaults.trackingId || '',
    selectedLocaleId: localeId,
    selectedListingId: '',
    selectedContextPresetId: 'default',
    isTopPanelMinimized: false,
    advancedContext: {
      custom: {},
      dictionaryFieldContext: {},
    },
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderInitializationError(mount: HTMLElement, error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown initialization error.';
  const domain = error instanceof ConfigDomainError ? ` (${error.domain})` : '';

  mount.innerHTML = `
    <section class="troubleshoot-root">
      <div class="init-error">
        <h2>Initialization Error${domain}</h2>
        <p>${escapeHtml(message)}</p>
      </div>
    </section>
  `;
}

export async function bootstrap(): Promise<void> {
  const mount = (await waitForTroubleshootMount()) ?? createFallbackMount();

  try {
    const config = loadRuntimeConfig();

    await preloadHeadlessCommerce();

    const store = createTroubleshootStateStore({
      defaults: getStateDefaults(config),
      defaultPresets: [createDefaultPreset()],
    });

    const cmhService = new CmhConfigService({
      organizationId: config.organizationId,
      accessToken: config.cmhAccessToken,
      defaults: config.defaults,
    });

    const engine = createTroubleshootEngine({
      organizationId: config.organizationId,
      engineAccessToken: config.engineAccessToken,
    });

    const page = new TroubleshootPage({
      mount,
      config,
      cmhService,
      engine,
      store,
    });

    await page.init();
  } catch (error) {
    renderInitializationError(mount, error);
  }
}
