import { ConfigDomainError, type AppRuntimeConfig } from '../types/app-config';
import type { ProductTemplatePreset, TroubleshootState } from '../types/troubleshoot';
import { loadRuntimeConfig } from '../services/config-loader';
import { createTroubleshootStateStore, createDefaultPreset } from '../state/troubleshoot-state';
import { CmhConfigService } from '../services/cmh-config-service';
import { preloadHeadlessCommerce } from './troubleshoot-engine';
import { TroubleshootPage } from './troubleshoot-page';
import atomicDefaultProductListTemplate from '../product-templates/atomic-default/product-list.html?raw';
import atomicDefaultInstantProductsTemplate from '../product-templates/atomic-default/instant-products.html?raw';
import atomicExample1ProductListTemplate from '../product-templates/atomic-example-1/product-list.html?raw';
import atomicExample1InstantProductsTemplate from '../product-templates/atomic-example-1/instant-products.html?raw';
import atomicExample2ProductListTemplate from '../product-templates/atomic-example-2/product-list.html?raw';
import atomicExample2InstantProductsTemplate from '../product-templates/atomic-example-2/instant-products.html?raw';

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

function normalizeTemplateSource(value: string): string {
  return value.trim();
}

function getStateDefaults(
  config: AppRuntimeConfig,
  defaultProductTemplatePresets: ProductTemplatePreset[]
): TroubleshootState {
  const localeId = `${config.defaults.language}-${config.defaults.country}-${config.defaults.currency}`.toLowerCase();
  const selectedProductTemplatePresetId = config.defaultProductTemplatePresetId || 'default';
  const selectedProductTemplatePreset =
    defaultProductTemplatePresets.find((preset) => preset.id === selectedProductTemplatePresetId) ??
    defaultProductTemplatePresets.find((preset) => preset.id === 'default') ??
    defaultProductTemplatePresets[0];
  const selectedProductTemplates = selectedProductTemplatePreset?.productTemplates ?? {
    productList: '',
    instantProducts: '',
  };

  return {
    mode: 'search',
    selectedTrackingId: config.defaults.trackingId || '',
    selectedLocaleId: localeId,
    selectedListingId: '',
    selectedContextPresetId: 'default',
    selectedProductTemplatePresetId: selectedProductTemplatePreset?.id ?? 'default',
    isTopPanelMinimized: false,
    isSessionPanelMinimized: true,
    productListOptions: {
      display: 'grid',
      density: 'compact',
      imageSize: 'small',
      instantProductsImageSize: 'small',
    },
    productTemplates: {
      productList: selectedProductTemplates.productList,
      instantProducts: selectedProductTemplates.instantProducts,
    },
    advancedContext: {
      custom: {},
      dictionaryFieldContext: {},
    },
  };
}

function createDefaultProductTemplatePresets(): ProductTemplatePreset[] {
  const defaultPreset: ProductTemplatePreset = {
    id: 'default',
    label: 'Atomic Default',
    productTemplates: {
      productList: normalizeTemplateSource(atomicDefaultProductListTemplate),
      instantProducts: normalizeTemplateSource(atomicDefaultInstantProductsTemplate),
    },
  };

  const example1Preset: ProductTemplatePreset = {
    id: 'atomic-example-1',
    label: 'Atomic Example 1',
    productTemplates: {
      productList: normalizeTemplateSource(atomicExample1ProductListTemplate),
      instantProducts: normalizeTemplateSource(atomicExample1InstantProductsTemplate),
    },
  };

  const example2Preset: ProductTemplatePreset = {
    id: 'atomic-example-2',
    label: 'Atomic Example 2',
    productTemplates: {
      productList: normalizeTemplateSource(atomicExample2ProductListTemplate),
      instantProducts: normalizeTemplateSource(atomicExample2InstantProductsTemplate),
    },
  };

  return [defaultPreset, example1Preset, example2Preset];
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
    const defaultProductTemplatePresets = createDefaultProductTemplatePresets();

    await preloadHeadlessCommerce();

    const store = createTroubleshootStateStore({
      defaults: getStateDefaults(config, defaultProductTemplatePresets),
      defaultPresets: [createDefaultPreset()],
      defaultProductTemplatePresets,
    });

    const cmhService = new CmhConfigService({
      organizationId: config.organizationId,
      accessToken: config.cmhAccessToken,
      defaults: config.defaults,
    });

    const page = new TroubleshootPage({
      mount,
      config,
      cmhService,
      store,
    });

    await page.init();
  } catch (error) {
    renderInitializationError(mount, error);
  }
}
