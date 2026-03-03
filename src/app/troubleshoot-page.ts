import template from '../templates/troubleshoot.html?raw';
import searchInterfaceTemplate from '../templates/atomic-search-interface.html?raw';
import listingInterfaceTemplate from '../templates/atomic-listing-interface.html?raw';
import type {AppRuntimeConfig} from '../types/app-config';
import type {
  AdvancedContext,
  ContextPreset,
  ProductListImageSize,
  ProductListOptions,
  ProductTemplatePreset,
  TrackingData,
  TrackingListing,
  TrackingLocale,
  TroubleshootMode,
  TroubleshootState,
} from '../types/troubleshoot';
import type {CmhConfigService} from '../services/cmh-config-service';
import type {CmhRequestTraceEntry} from '../services/cmh-config-service';
import {
  createTroubleshootEngine,
  ensureAtomicCommerceLoaded,
  getAtomicAssetDiagnostics,
} from './troubleshoot-engine';
import type {TroubleshootStateStore} from '../state/troubleshoot-state';

type TroubleshootPageDependencies = {
  mount: HTMLElement;
  config: AppRuntimeConfig;
  cmhService: CmhConfigService;
  store: TroubleshootStateStore;
};

type AtomicCommerceInterfaceElement = HTMLElement & {
  initializeWithEngine: (engine: unknown) => Promise<void>;
  executeFirstRequest: () => void;
};

type RequiredElements = {
  panelControls: HTMLElement;
  panelToggleButton: HTMLButtonElement;
  sessionPanel: HTMLElement;
  sessionToggleButton: HTMLButtonElement;
  sessionDetails: HTMLElement;
  trackingSelect: HTMLSelectElement;
  localeSelect: HTMLSelectElement;
  listingSelect: HTMLSelectElement;
  listingFilterInput: HTMLInputElement;
  listingFilterField: HTMLElement;
  listingSelectField: HTMLElement;
  productListDisplaySelect: HTMLSelectElement;
  productListDensitySelect: HTMLSelectElement;
  productListImageSizeSelect: HTMLSelectElement;
  instantProductsImageSizeSelect: HTMLSelectElement;
  presetSelect: HTMLSelectElement;
  productTemplatePresetSelect: HTMLSelectElement;
  modeButtons: HTMLButtonElement[];
  runButton: HTMLButtonElement;
  resetButton: HTMLButtonElement;
  openAdvancedButton: HTMLButtonElement;
  openPresetsButton: HTMLButtonElement;
  openAdvancedProductTemplatesButton: HTMLButtonElement;
  openProductTemplatePresetsButton: HTMLButtonElement;
  modePill: HTMLElement;
  trackingPill: HTMLElement;
  localePill: HTMLElement;
  listingPill: HTMLElement;
  searchRow: HTMLElement;
  listingRow: HTMLElement;
  searchUrl: HTMLElement;
  listingUrl: HTMLElement;
  status: HTMLElement;
  statusMini: HTMLElement;
  result: HTMLElement;
  atomicInterfaceRoot: HTMLElement;
  advancedDialog: HTMLDialogElement;
  presetsDialog: HTMLDialogElement;
  productTemplatesDialog: HTMLDialogElement;
  productTemplatePresetsDialog: HTMLDialogElement;
  customContextTextarea: HTMLTextAreaElement;
  dictionaryContextTextarea: HTMLTextAreaElement;
  productListTemplateTextarea: HTMLTextAreaElement;
  instantProductsTemplateTextarea: HTMLTextAreaElement;
  advancedError: HTMLElement;
  productTemplateError: HTMLElement;
  applyAdvancedButton: HTMLButtonElement;
  applyProductTemplatesButton: HTMLButtonElement;
  clearProductTemplatesButton: HTMLButtonElement;
  presetList: HTMLElement;
  addPresetButton: HTMLButtonElement;
  productTemplatePresetList: HTMLElement;
  addProductTemplatePresetButton: HTMLButtonElement;
};

function toId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '{}';
  }
}

function parseJsonObject(input: string): Record<string, unknown> {
  const trimmed = input.trim();
  if (!trimmed) {
    return {};
  }

  const parsed = JSON.parse(trimmed) as unknown;
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('Value must be a JSON object.');
  }

  return parsed as Record<string, unknown>;
}

function cloneAdvancedContextValue(context: AdvancedContext): AdvancedContext {
  return {
    custom: {...context.custom},
    dictionaryFieldContext: {...context.dictionaryFieldContext},
  };
}

function isSameAdvancedContext(a: AdvancedContext, b: AdvancedContext): boolean {
  try {
    return (
      JSON.stringify(a.custom) === JSON.stringify(b.custom) &&
      JSON.stringify(a.dictionaryFieldContext) === JSON.stringify(b.dictionaryFieldContext)
    );
  } catch {
    return false;
  }
}

function toProductListImageSize(value: string): ProductListImageSize {
  return value === 'large' || value === 'icon' || value === 'none' ? value : 'small';
}

function createFallbackTrackingData(config: AppRuntimeConfig): TrackingData[] {
  const localeId = `${config.defaults.language}-${config.defaults.country}-${config.defaults.currency}`.toLowerCase();

  return [
    {
      trackingId: config.defaults.trackingId || 'default-tracking-id',
      locales: [
        {
          id: localeId,
          label: `${config.defaults.language.toUpperCase()}-${config.defaults.country.toUpperCase()} (${config.defaults.currency.toUpperCase()})`,
          language: config.defaults.language,
          country: config.defaults.country,
          currency: config.defaults.currency,
          viewUrl: config.defaults.viewUrl,
        },
      ],
      listings: [],
    },
  ];
}

function upsertOptions(
  select: HTMLSelectElement,
  options: Array<{value: string; label: string}>,
  selectedValue: string
) {
  select.innerHTML = '';

  for (const option of options) {
    const node = document.createElement('option');
    node.value = option.value;
    node.textContent = option.label;
    if (option.value === selectedValue) {
      node.selected = true;
    }
    select.append(node);
  }
}

function buildInterfaceMarkup(mode: TroubleshootMode): string {
  return mode === 'listing' ? listingInterfaceTemplate : searchInterfaceTemplate;
}

export class TroubleshootPage {
  private readonly mount: HTMLElement;
  private readonly config: AppRuntimeConfig;
  private readonly cmhService: CmhConfigService;
  private readonly store: TroubleshootStateStore;

  private trackingData: TrackingData[] = [];
  private elements!: RequiredElements;
  private activeApplyToken = 0;
  private editingContextPresetId: string | null = null;
  private editingProductTemplatePresetId: string | null = null;

  public constructor(dependencies: TroubleshootPageDependencies) {
    this.mount = dependencies.mount;
    this.config = dependencies.config;
    this.cmhService = dependencies.cmhService;
    this.store = dependencies.store;
  }

  public async init() {
    this.mount.innerHTML = template;
    this.cacheElements();
    this.wireEvents();

    this.store.subscribe(() => {
      this.syncViewWithState();
    });

    // Populate controls immediately from profile defaults. CMH discovery updates these in background.
    this.trackingData = createFallbackTrackingData(this.config);
    this.syncViewWithState();
    this.setStatus('Initializing with profile defaults while CMH data loads...');
    void this.loadTrackingDataInBackground();

    void this.applyTroubleshootingState('initialization');
  }

  private async loadTrackingDataInBackground() {
    try {
      const trackingData = await this.cmhService.getTrackingData();
      const trace = this.cmhService.getRequestTrace();
      if (trackingData.length > 0) {
        this.trackingData = trackingData;
        this.syncViewWithState();
        this.setStatus(
          `Loaded ${trackingData.length} tracking IDs from CMH (${this.formatRequestTraceSummary(trace)}).`
        );
        void this.applyTroubleshootingState('cmh data loaded');
        return;
      }
    } catch {
      // Keep fallback controls populated; status is set below.
    }
    const trace = this.cmhService.getRequestTrace();
    this.setStatus(
      `CMH discovery unavailable (${this.formatRequestTraceSummary(trace)}). Using profile default tracking/locale.`
    );
  }

  private formatRequestTraceSummary(trace: CmhRequestTraceEntry[]): string {
    if (trace.length === 0) {
      return 'no requests recorded';
    }

    const failures = trace.filter((entry) => !entry.ok).length;
    if (failures === 0) {
      return `${trace.length} request${trace.length === 1 ? '' : 's'} succeeded`;
    }

    return `${trace.length} request${trace.length === 1 ? '' : 's'}, ${failures} failed`;
  }

  private mustQuery<T extends Element>(selector: string): T {
    const node = this.mount.querySelector(selector);
    if (!node) {
      throw new Error(`Missing required element: ${selector}`);
    }
    return node as T;
  }

  private cacheElements() {
    this.elements = {
      panelControls: this.mustQuery<HTMLElement>('[data-role="top-panel-controls"]'),
      panelToggleButton: this.mustQuery<HTMLButtonElement>('[data-action="toggle-panel"]'),
      sessionPanel: this.mustQuery<HTMLElement>('[data-role="session-panel"]'),
      sessionToggleButton: this.mustQuery<HTMLButtonElement>('[data-action="toggle-session"]'),
      sessionDetails: this.mustQuery<HTMLElement>('[data-role="session-details"]'),
      trackingSelect: this.mustQuery<HTMLSelectElement>('[data-control="tracking"]'),
      localeSelect: this.mustQuery<HTMLSelectElement>('[data-control="locale"]'),
      listingSelect: this.mustQuery<HTMLSelectElement>('[data-control="listing"]'),
      listingFilterInput: this.mustQuery<HTMLInputElement>('[data-control="listing-filter"]'),
      listingFilterField: this.mustQuery<HTMLElement>('[data-role="listing-filter-field"]'),
      listingSelectField: this.mustQuery<HTMLElement>('[data-role="listing-select-field"]'),
      productListDisplaySelect: this.mustQuery<HTMLSelectElement>(
        '[data-control="product-list-display"]'
      ),
      productListDensitySelect: this.mustQuery<HTMLSelectElement>(
        '[data-control="product-list-density"]'
      ),
      productListImageSizeSelect: this.mustQuery<HTMLSelectElement>(
        '[data-control="product-list-image-size"]'
      ),
      instantProductsImageSizeSelect: this.mustQuery<HTMLSelectElement>(
        '[data-control="instant-products-image-size"]'
      ),
      presetSelect: this.mustQuery<HTMLSelectElement>('[data-control="preset"]'),
      productTemplatePresetSelect: this.mustQuery<HTMLSelectElement>(
        '[data-control="product-template-preset"]'
      ),
      modeButtons: [...this.mount.querySelectorAll<HTMLButtonElement>('[data-mode]')],
      runButton: this.mustQuery<HTMLButtonElement>('[data-action="run-request"]'),
      resetButton: this.mustQuery<HTMLButtonElement>('[data-action="reset-state"]'),
      openAdvancedButton: this.mustQuery<HTMLButtonElement>('[data-action="open-advanced"]'),
      openPresetsButton: this.mustQuery<HTMLButtonElement>('[data-action="open-presets"]'),
      openAdvancedProductTemplatesButton: this.mustQuery<HTMLButtonElement>(
        '[data-action="open-advanced-product-templates"]'
      ),
      openProductTemplatePresetsButton: this.mustQuery<HTMLButtonElement>(
        '[data-action="open-product-template-presets"]'
      ),
      modePill: this.mustQuery<HTMLElement>('[data-field="mode-pill"]'),
      trackingPill: this.mustQuery<HTMLElement>('[data-field="tracking-pill"]'),
      localePill: this.mustQuery<HTMLElement>('[data-field="locale-pill"]'),
      listingPill: this.mustQuery<HTMLElement>('[data-field="listing-pill"]'),
      searchRow: this.mustQuery<HTMLElement>('[data-field="search-row"]'),
      listingRow: this.mustQuery<HTMLElement>('[data-field="listing-row"]'),
      searchUrl: this.mustQuery<HTMLElement>('[data-field="search-url"]'),
      listingUrl: this.mustQuery<HTMLElement>('[data-field="listing-url"]'),
      status: this.mustQuery<HTMLElement>('[data-field="status"]'),
      statusMini: this.mustQuery<HTMLElement>('[data-field="status-mini"]'),
      result: this.mustQuery<HTMLElement>('[data-field="result"]'),
      atomicInterfaceRoot: this.mustQuery<HTMLElement>('[data-role="atomic-interface-root"]'),
      advancedDialog: this.mustQuery<HTMLDialogElement>('[data-modal="advanced-context"]'),
      presetsDialog: this.mustQuery<HTMLDialogElement>('[data-modal="manage-presets"]'),
      productTemplatesDialog: this.mustQuery<HTMLDialogElement>('[data-modal="product-templates"]'),
      productTemplatePresetsDialog: this.mustQuery<HTMLDialogElement>(
        '[data-modal="manage-product-template-presets"]'
      ),
      customContextTextarea: this.mustQuery<HTMLTextAreaElement>('[data-field="custom-context"]'),
      dictionaryContextTextarea: this.mustQuery<HTMLTextAreaElement>('[data-field="dictionary-context"]'),
      productListTemplateTextarea: this.mustQuery<HTMLTextAreaElement>(
        '[data-field="product-list-template"]'
      ),
      instantProductsTemplateTextarea: this.mustQuery<HTMLTextAreaElement>(
        '[data-field="instant-products-template"]'
      ),
      advancedError: this.mustQuery<HTMLElement>('[data-field="advanced-error"]'),
      productTemplateError: this.mustQuery<HTMLElement>('[data-field="product-template-error"]'),
      applyAdvancedButton: this.mustQuery<HTMLButtonElement>('[data-action="apply-advanced"]'),
      applyProductTemplatesButton: this.mustQuery<HTMLButtonElement>(
        '[data-action="apply-product-templates"]'
      ),
      clearProductTemplatesButton: this.mustQuery<HTMLButtonElement>(
        '[data-action="clear-product-templates"]'
      ),
      presetList: this.mustQuery<HTMLElement>('[data-role="preset-list"]'),
      addPresetButton: this.mustQuery<HTMLButtonElement>('[data-action="add-preset"]'),
      productTemplatePresetList: this.mustQuery<HTMLElement>(
        '[data-role="product-template-preset-list"]'
      ),
      addProductTemplatePresetButton: this.mustQuery<HTMLButtonElement>(
        '[data-action="add-product-template-preset"]'
      ),
    };
  }

  private wireEvents() {
    this.elements.panelToggleButton.addEventListener('click', () => {
      const current = this.store.getSnapshot().state.isTopPanelMinimized;
      this.store.updateState({isTopPanelMinimized: !current});
    });

    this.elements.sessionToggleButton.addEventListener('click', () => {
      const current = this.store.getSnapshot().state.isSessionPanelMinimized;
      this.store.updateState({isSessionPanelMinimized: !current});
    });

    this.elements.advancedDialog.addEventListener('close', () => {
      this.editingContextPresetId = null;
    });

    this.elements.productTemplatesDialog.addEventListener('close', () => {
      this.editingProductTemplatePresetId = null;
    });

    const applyProductListOptions = () => {
      const options: ProductListOptions = {
        display: this.elements.productListDisplaySelect.value === 'list' ? 'list' : 'grid',
        density:
          this.elements.productListDensitySelect.value === 'comfortable'
            ? 'comfortable'
            : this.elements.productListDensitySelect.value === 'normal'
              ? 'normal'
              : 'compact',
        imageSize: toProductListImageSize(this.elements.productListImageSizeSelect.value),
        instantProductsImageSize: toProductListImageSize(
          this.elements.instantProductsImageSizeSelect.value
        ),
      };

      this.store.updateState({
        productListOptions: options,
      });
      void this.applyTroubleshootingState('product list options changed');
    };

    this.elements.productListDisplaySelect.addEventListener('change', applyProductListOptions);
    this.elements.productListDensitySelect.addEventListener('change', applyProductListOptions);
    this.elements.productListImageSizeSelect.addEventListener('change', applyProductListOptions);
    this.elements.instantProductsImageSizeSelect.addEventListener('change', applyProductListOptions);

    this.elements.trackingSelect.addEventListener('change', () => {
      this.store.updateState({
        selectedTrackingId: this.elements.trackingSelect.value,
        selectedLocaleId: '',
        selectedListingId: '',
      });
      void this.applyTroubleshootingState('tracking changed');
    });

    this.elements.localeSelect.addEventListener('change', () => {
      this.store.updateState({
        selectedLocaleId: this.elements.localeSelect.value,
        selectedListingId: '',
      });
      void this.applyTroubleshootingState('locale changed');
    });

    this.elements.listingFilterInput.addEventListener('input', () => {
      this.refreshListingSelect();
    });

    this.elements.listingSelect.addEventListener('change', () => {
      this.store.updateState({selectedListingId: this.elements.listingSelect.value});
      void this.applyTroubleshootingState('listing changed');
    });

    for (const modeButton of this.elements.modeButtons) {
      modeButton.addEventListener('click', () => {
        const mode = modeButton.dataset.mode === 'listing' ? 'listing' : 'search';
        this.store.updateState({mode});
        void this.applyTroubleshootingState('mode changed');
      });
    }

    this.elements.presetSelect.addEventListener('change', () => {
      const presetId = this.elements.presetSelect.value;
      const preset = this.getPresetById(presetId) ?? this.getPresetById('default');
      if (!preset) {
        return;
      }

      this.store.updateState({
        selectedContextPresetId: preset.id,
        advancedContext: cloneAdvancedContextValue(preset.advancedContext),
      });
      void this.applyTroubleshootingState('preset changed');
    });

    this.elements.productTemplatePresetSelect.addEventListener('change', () => {
      const presetId = this.elements.productTemplatePresetSelect.value;
      const preset = this.getProductTemplatePresetById(presetId);
      if (!preset) {
        this.store.updateState({selectedProductTemplatePresetId: 'default'});
        return;
      }

      this.store.updateState({
        selectedProductTemplatePresetId: preset.id,
        productTemplates: {
          productList: preset.productTemplates.productList,
          instantProducts: preset.productTemplates.instantProducts,
        },
      });

      void this.applyTroubleshootingState('product template preset changed');
    });

    this.elements.openAdvancedButton.addEventListener('click', () => {
      const snapshot = this.store.getSnapshot();
      const selectedPreset = this.getPresetById(snapshot.state.selectedContextPresetId);
      const advancedContext = selectedPreset?.advancedContext ?? snapshot.state.advancedContext;
      this.editingContextPresetId = selectedPreset?.id ?? null;
      this.elements.customContextTextarea.value = safeStringify(advancedContext.custom);
      this.elements.dictionaryContextTextarea.value = safeStringify(advancedContext.dictionaryFieldContext);
      this.clearAdvancedError();
      this.elements.advancedDialog.showModal();
    });

    this.elements.applyAdvancedButton.addEventListener('click', () => {
      try {
        const nextContext: AdvancedContext = {
          custom: parseJsonObject(this.elements.customContextTextarea.value),
          dictionaryFieldContext: parseJsonObject(this.elements.dictionaryContextTextarea.value),
        };

        const editingPresetId = this.editingContextPresetId;
        if (editingPresetId) {
          const preset = this.getPresetById(editingPresetId);
          if (!preset) {
            throw new Error(`Unknown context preset "${editingPresetId}".`);
          }

          this.store.upsertPreset({
            ...preset,
            advancedContext: nextContext,
          });
          this.store.setAdvancedContext(nextContext);
          this.renderPresetList();
          this.clearAdvancedError();
          this.editingContextPresetId = null;
          this.elements.advancedDialog.close();
          void this.applyTroubleshootingState('context preset updated');
          return;
        }

        this.store.setAdvancedContext(nextContext);
        this.elements.advancedDialog.close();
        this.clearAdvancedError();
        void this.applyTroubleshootingState('advanced context updated');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid JSON.';
        this.elements.advancedError.hidden = false;
        this.elements.advancedError.textContent = message;
      }
    });

    this.elements.openPresetsButton.addEventListener('click', () => {
      this.renderPresetList();
      this.elements.presetsDialog.showModal();
    });

    this.elements.openAdvancedProductTemplatesButton.addEventListener('click', () => {
      this.editingProductTemplatePresetId = null;
      const state = this.store.getSnapshot().state;
      this.elements.productListTemplateTextarea.value = state.productTemplates.productList;
      this.elements.instantProductsTemplateTextarea.value = state.productTemplates.instantProducts;
      this.clearProductTemplateError();
      this.elements.productTemplatesDialog.showModal();
    });

    this.elements.openProductTemplatePresetsButton.addEventListener('click', () => {
      this.renderProductTemplatePresetList();
      this.elements.productTemplatePresetsDialog.showModal();
    });

    this.elements.applyProductTemplatesButton.addEventListener('click', () => {
      try {
        const productList = this.elements.productListTemplateTextarea.value;
        const instantProducts = this.elements.instantProductsTemplateTextarea.value;
        this.ensureSafeTemplateHtml(productList);
        this.ensureSafeTemplateHtml(instantProducts);

        const editingPresetId = this.editingProductTemplatePresetId;
        if (editingPresetId) {
          const preset = this.getProductTemplatePresetById(editingPresetId);
          if (!preset) {
            throw new Error(`Unknown product template preset "${editingPresetId}".`);
          }

          this.store.upsertProductTemplatePreset({
            ...preset,
            productTemplates: {
              productList,
              instantProducts,
            },
          });
          this.renderProductTemplatePresetList();
          this.clearProductTemplateError();
          this.editingProductTemplatePresetId = null;
          this.elements.productTemplatesDialog.close();
          void this.applyTroubleshootingState('product template preset updated');
          return;
        }

        this.store.updateState({
          productTemplates: {
            productList,
            instantProducts,
          },
        });
        this.clearProductTemplateError();
        this.elements.productTemplatesDialog.close();
        void this.applyTroubleshootingState('product templates updated');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Invalid template HTML.';
        this.elements.productTemplateError.hidden = false;
        this.elements.productTemplateError.textContent = message;
      }
    });

    this.elements.clearProductTemplatesButton.addEventListener('click', () => {
      this.elements.productListTemplateTextarea.value = '';
      this.elements.instantProductsTemplateTextarea.value = '';

      const editingPresetId = this.editingProductTemplatePresetId;
      if (editingPresetId) {
        const preset = this.getProductTemplatePresetById(editingPresetId);
        if (preset) {
          this.store.upsertProductTemplatePreset({
            ...preset,
            productTemplates: {
              productList: '',
              instantProducts: '',
            },
          });
          this.renderProductTemplatePresetList();
        }
      } else {
        this.store.updateState({
          productTemplates: {
            productList: '',
            instantProducts: '',
          },
        });
      }

      this.editingProductTemplatePresetId = null;
      this.clearProductTemplateError();
      this.elements.productTemplatesDialog.close();
      void this.applyTroubleshootingState('product templates cleared');
    });

    this.elements.productTemplatePresetList.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!(target instanceof HTMLButtonElement)) {
        return;
      }

      const action = target.dataset.templatePresetAction;
      const presetId = target.dataset.templatePresetId;
      if (!action || !presetId) {
        return;
      }

      const preset = this.getProductTemplatePresetById(presetId);
      if (!preset) {
        return;
      }

      if (action === 'edit') {
        this.editingProductTemplatePresetId = preset.id;
        this.elements.productListTemplateTextarea.value = preset.productTemplates.productList;
        this.elements.instantProductsTemplateTextarea.value = preset.productTemplates.instantProducts;
        this.clearProductTemplateError();
        this.elements.productTemplatePresetsDialog.close();
        this.elements.productTemplatesDialog.showModal();
      }

      if (action === 'apply') {
        this.store.updateState({
          selectedProductTemplatePresetId: preset.id,
          productTemplates: {
            productList: preset.productTemplates.productList,
            instantProducts: preset.productTemplates.instantProducts,
          },
        });
        void this.applyTroubleshootingState('product template preset applied');
      }

      if (action === 'rename') {
        const nextLabel = window.prompt('Product template preset label', preset.label)?.trim();
        if (nextLabel) {
          this.store.upsertProductTemplatePreset({...preset, label: nextLabel});
        }
      }

      if (action === 'remove') {
        const confirmed = window.confirm(`Delete product template preset "${preset.label}"?`);
        if (confirmed) {
          this.store.removeProductTemplatePreset(preset.id);
          void this.applyTroubleshootingState('product template preset removed');
        }
      }

      this.renderProductTemplatePresetList();
    });

    this.elements.presetList.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!(target instanceof HTMLButtonElement)) {
        return;
      }

      const action = target.dataset.presetAction;
      const presetId = target.dataset.presetId;
      if (!action || !presetId) {
        return;
      }

      const preset = this.getPresetById(presetId);
      if (!preset) {
        return;
      }

      if (action === 'apply') {
        this.store.updateState({
          selectedContextPresetId: preset.id,
          advancedContext: cloneAdvancedContextValue(preset.advancedContext),
        });
        void this.applyTroubleshootingState('preset applied');
      }

      if (action === 'edit') {
        this.editingContextPresetId = preset.id;
        this.elements.customContextTextarea.value = safeStringify(preset.advancedContext.custom);
        this.elements.dictionaryContextTextarea.value = safeStringify(
          preset.advancedContext.dictionaryFieldContext
        );
        this.clearAdvancedError();
        this.elements.presetsDialog.close();
        this.elements.advancedDialog.showModal();
      }

      if (action === 'rename') {
        const nextLabel = window.prompt('Preset label', preset.label)?.trim();
        if (nextLabel) {
          this.store.upsertPreset({...preset, label: nextLabel});
        }
      }

      if (action === 'remove') {
        const confirmed = window.confirm(`Delete preset "${preset.label}"?`);
        if (confirmed) {
          this.store.removePreset(preset.id);
        }
      }

      this.renderPresetList();
    });

    this.elements.addPresetButton.addEventListener('click', () => {
      const label = window.prompt('Label for new preset', 'New preset')?.trim();
      if (!label) {
        return;
      }

      const state = this.store.getSnapshot().state;
      this.store.upsertPreset({
        id: `${toId(label)}-${Date.now().toString(36)}`,
        label,
        advancedContext: {
          custom: {...state.advancedContext.custom},
          dictionaryFieldContext: {...state.advancedContext.dictionaryFieldContext},
        },
      });
      this.renderPresetList();
    });

    this.elements.addProductTemplatePresetButton.addEventListener('click', () => {
      const label = window.prompt('Label for new product template preset', 'New product template preset')?.trim();
      if (!label) {
        return;
      }

      const state = this.store.getSnapshot().state;
      this.store.upsertProductTemplatePreset({
        id: `${toId(label)}-${Date.now().toString(36)}`,
        label,
        productTemplates: {
          productList: state.productTemplates.productList,
          instantProducts: state.productTemplates.instantProducts,
        },
      });
      this.renderProductTemplatePresetList();
    });

    this.elements.runButton.addEventListener('click', () => {
      void this.applyTroubleshootingState('manual apply');
    });

    this.elements.resetButton.addEventListener('click', () => {
      this.elements.listingFilterInput.value = '';
      this.store.reset();
      void this.applyTroubleshootingState('state reset');
    });
  }

  private clearAdvancedError() {
    this.elements.advancedError.hidden = true;
    this.elements.advancedError.textContent = '';
  }

  private clearProductTemplateError() {
    this.elements.productTemplateError.hidden = true;
    this.elements.productTemplateError.textContent = '';
  }

  private ensureSafeTemplateHtml(value: string) {
    if (/<\s*script[\s>]/i.test(value)) {
      throw new Error('Template HTML cannot include <script> tags.');
    }
  }

  private getCurrentTracking(): TrackingData | undefined {
    const {selectedTrackingId} = this.store.getSnapshot().state;
    return this.trackingData.find((tracking) => tracking.trackingId === selectedTrackingId);
  }

  private getCurrentLocale(): TrackingLocale | undefined {
    const tracking = this.getCurrentTracking();
    const {selectedLocaleId} = this.store.getSnapshot().state;
    return tracking?.locales.find((locale) => locale.id === selectedLocaleId);
  }

  private getCurrentListing(): TrackingListing | undefined {
    const tracking = this.getCurrentTracking();
    const {selectedListingId} = this.store.getSnapshot().state;
    return tracking?.listings.find((listing) => listing.id === selectedListingId);
  }

  private getPresetById(id: string): ContextPreset | undefined {
    return this.store.getSnapshot().presets.find((preset) => preset.id === id);
  }

  private getProductTemplatePresetById(id: string): ProductTemplatePreset | undefined {
    return this.store.getSnapshot().productTemplatePresets.find((preset) => preset.id === id);
  }

  private ensureSelectionsAreValid(): boolean {
    const snapshot = this.store.getSnapshot();
    const patch: Partial<TroubleshootState> = {};

    const currentTracking =
      this.trackingData.find((tracking) => tracking.trackingId === snapshot.state.selectedTrackingId) ??
      this.trackingData[0];

    if (currentTracking && currentTracking.trackingId !== snapshot.state.selectedTrackingId) {
      patch.selectedTrackingId = currentTracking.trackingId;
    }

    const trackingForLocale =
      this.trackingData.find(
        (tracking) =>
          tracking.trackingId === (patch.selectedTrackingId ?? snapshot.state.selectedTrackingId)
      ) ?? this.trackingData[0];

    const locale =
      trackingForLocale?.locales.find((candidate) => candidate.id === snapshot.state.selectedLocaleId) ??
      trackingForLocale?.locales[0];

    if (locale && locale.id !== snapshot.state.selectedLocaleId) {
      patch.selectedLocaleId = locale.id;
    }

    const listing =
      trackingForLocale?.listings.find((candidate) => candidate.id === snapshot.state.selectedListingId) ??
      trackingForLocale?.listings[0];

    if (!listing && snapshot.state.selectedListingId) {
      patch.selectedListingId = '';
    }

    if (listing && listing.id !== snapshot.state.selectedListingId) {
      patch.selectedListingId = listing.id;
    }

    if (!this.getPresetById(snapshot.state.selectedContextPresetId)) {
      patch.selectedContextPresetId = 'default';
    }

    const selectedContextPresetId = patch.selectedContextPresetId ?? snapshot.state.selectedContextPresetId;
    const selectedContextPreset = this.getPresetById(selectedContextPresetId);
    const currentAdvancedContext = patch.advancedContext ?? snapshot.state.advancedContext;
    if (
      selectedContextPreset &&
      !isSameAdvancedContext(currentAdvancedContext, selectedContextPreset.advancedContext)
    ) {
      patch.advancedContext = cloneAdvancedContextValue(selectedContextPreset.advancedContext);
    }

    if (!this.getProductTemplatePresetById(snapshot.state.selectedProductTemplatePresetId)) {
      const fallbackTemplatePreset = this.store
        .getSnapshot()
        .productTemplatePresets.find((preset) => preset.id === 'default');

      if (fallbackTemplatePreset) {
        patch.selectedProductTemplatePresetId = fallbackTemplatePreset.id;
        patch.productTemplates = {
          productList: fallbackTemplatePreset.productTemplates.productList,
          instantProducts: fallbackTemplatePreset.productTemplates.instantProducts,
        };
      }
    }

    if (Object.keys(patch).length > 0) {
      this.store.updateState(patch);
      return false;
    }

    return true;
  }

  private refreshTrackingSelect() {
    const state = this.store.getSnapshot().state;
    upsertOptions(
      this.elements.trackingSelect,
      this.trackingData.map((tracking) => ({
        value: tracking.trackingId,
        label: tracking.trackingId,
      })),
      state.selectedTrackingId
    );
  }

  private refreshLocaleSelect() {
    const state = this.store.getSnapshot().state;
    const tracking = this.getCurrentTracking();

    upsertOptions(
      this.elements.localeSelect,
      (tracking?.locales ?? []).map((locale) => ({
        value: locale.id,
        label: `${locale.label} [${locale.language}-${locale.country}-${locale.currency}]`,
      })),
      state.selectedLocaleId
    );
  }

  private refreshListingSelect() {
    const state = this.store.getSnapshot().state;
    const tracking = this.getCurrentTracking();
    const allListings = tracking?.listings ?? [];
    const query = this.elements.listingFilterInput.value.trim().toLowerCase();

    let filteredListings =
      query.length === 0
        ? allListings
        : allListings.filter((listing) => {
            const haystack = `${listing.label} ${listing.id} ${listing.url}`.toLowerCase();
            return haystack.includes(query);
          });

    const selectedListing = allListings.find((listing) => listing.id === state.selectedListingId);
    if (selectedListing && !filteredListings.some((listing) => listing.id === selectedListing.id)) {
      filteredListings = [selectedListing, ...filteredListings];
    }

    const options =
      filteredListings.length > 0
        ? filteredListings.map((listing) => ({
            value: listing.id,
            label: `${listing.label} (${listing.id})`,
          }))
        : [{value: '', label: 'No listing available'}];

    upsertOptions(this.elements.listingSelect, options, state.selectedListingId);
    this.elements.listingSelect.disabled = filteredListings.length === 0;
  }

  private refreshPresetSelect() {
    const snapshot = this.store.getSnapshot();

    upsertOptions(
      this.elements.presetSelect,
      snapshot.presets.map((preset) => ({
        value: preset.id,
        label: preset.label,
      })),
      snapshot.state.selectedContextPresetId
    );
  }

  private refreshProductTemplatePresetSelect() {
    const snapshot = this.store.getSnapshot();

    upsertOptions(
      this.elements.productTemplatePresetSelect,
      snapshot.productTemplatePresets.map((preset) => ({
        value: preset.id,
        label: preset.label,
      })),
      snapshot.state.selectedProductTemplatePresetId
    );
  }

  private refreshProductListOptionControls() {
    const options = this.store.getSnapshot().state.productListOptions;
    this.elements.productListDisplaySelect.value = options.display;
    this.elements.productListDensitySelect.value = options.density;
    this.elements.productListImageSizeSelect.value = options.imageSize;
    this.elements.instantProductsImageSizeSelect.value = options.instantProductsImageSize;
  }

  private refreshModeButtons() {
    const mode = this.store.getSnapshot().state.mode;
    const isSearchMode = mode === 'search';

    for (const button of this.elements.modeButtons) {
      const isActive = (button.dataset.mode ?? 'search') === mode;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    }

    this.elements.listingFilterField.hidden = isSearchMode;
    this.elements.listingSelectField.hidden = isSearchMode;
  }

  private refreshPanelVisibility() {
    const {isTopPanelMinimized} = this.store.getSnapshot().state;
    this.elements.panelControls.classList.toggle('is-minimized', isTopPanelMinimized);
    this.elements.panelToggleButton.setAttribute('aria-expanded', String(!isTopPanelMinimized));
    this.elements.panelToggleButton.title = isTopPanelMinimized
      ? 'Expand controls'
      : 'Minimize controls';
    this.elements.panelToggleButton.innerHTML = `<span aria-hidden="true">${
      isTopPanelMinimized ? '▸' : '▾'
    }</span>`;
  }

  private refreshSessionSummary() {
    const state = this.store.getSnapshot().state;
    const locale = this.getCurrentLocale();
    const listing = this.getCurrentListing();

    this.elements.modePill.textContent = `Mode: ${state.mode}`;
    this.elements.trackingPill.textContent = `Tracking: ${state.selectedTrackingId || 'n/a'}`;
    this.elements.localePill.textContent = `Locale: ${locale?.id || 'n/a'}`;
    this.elements.listingPill.textContent = `Listing: ${listing?.id || 'n/a'}`;

    this.elements.searchUrl.textContent = locale?.viewUrl || this.config.defaults.viewUrl;
    this.elements.listingUrl.textContent = listing?.url || 'n/a';

    const isSearchMode = state.mode === 'search';
    this.elements.searchRow.hidden = !isSearchMode;
    this.elements.listingRow.hidden = isSearchMode;
    this.elements.listingPill.hidden = isSearchMode;
  }

  private refreshSessionPanelVisibility() {
    const {isSessionPanelMinimized} = this.store.getSnapshot().state;
    this.elements.sessionPanel.classList.toggle('is-minimized', isSessionPanelMinimized);
    this.elements.sessionDetails.classList.toggle('is-minimized', isSessionPanelMinimized);
    this.elements.sessionToggleButton.setAttribute('aria-expanded', String(!isSessionPanelMinimized));
    this.elements.sessionToggleButton.title = isSessionPanelMinimized
      ? 'Expand diagnostics'
      : 'Collapse diagnostics';
    this.elements.sessionToggleButton.innerHTML = `<span aria-hidden="true">${
      isSessionPanelMinimized ? '▸' : '▾'
    }</span>`;
  }

  private renderPresetList() {
    const {presets} = this.store.getSnapshot();
    this.elements.presetList.innerHTML = '';

    for (const preset of presets) {
      const item = document.createElement('li');
      item.className = 'preset-row';

      const details = document.createElement('div');
      const label = document.createElement('strong');
      label.textContent = preset.label;
      const br = document.createElement('br');
      const id = document.createElement('code');
      id.textContent = preset.id;
      details.append(label, br, id);

      const actions = document.createElement('div');
      actions.className = 'button-row';

      const applyButton = document.createElement('button');
      applyButton.type = 'button';
      applyButton.dataset.presetAction = 'apply';
      applyButton.dataset.presetId = preset.id;
      applyButton.textContent = 'Apply';

      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.dataset.presetAction = 'edit';
      editButton.dataset.presetId = preset.id;
      editButton.textContent = 'Edit JSON';

      const renameButton = document.createElement('button');
      renameButton.type = 'button';
      renameButton.dataset.presetAction = 'rename';
      renameButton.dataset.presetId = preset.id;
      renameButton.textContent = 'Rename';

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.dataset.presetAction = 'remove';
      removeButton.dataset.presetId = preset.id;
      removeButton.textContent = 'Delete';
      removeButton.disabled = preset.id === 'default';

      actions.append(applyButton, editButton, renameButton, removeButton);
      item.append(details, actions);
      this.elements.presetList.append(item);
    }
  }

  private renderProductTemplatePresetList() {
    const {productTemplatePresets, state} = this.store.getSnapshot();
    this.elements.productTemplatePresetList.innerHTML = '';

    for (const preset of productTemplatePresets) {
      const item = document.createElement('li');
      item.className = 'preset-row';

      const details = document.createElement('div');
      const label = document.createElement('strong');
      label.textContent = preset.label;
      const br = document.createElement('br');
      const id = document.createElement('code');
      id.textContent = preset.id;
      details.append(label, br, id);

      const actions = document.createElement('div');
      actions.className = 'button-row';

      const applyButton = document.createElement('button');
      applyButton.type = 'button';
      applyButton.dataset.templatePresetAction = 'apply';
      applyButton.dataset.templatePresetId = preset.id;
      applyButton.textContent = state.selectedProductTemplatePresetId === preset.id ? 'Applied' : 'Apply';
      applyButton.disabled = state.selectedProductTemplatePresetId === preset.id;

      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.dataset.templatePresetAction = 'edit';
      editButton.dataset.templatePresetId = preset.id;
      editButton.textContent = 'Edit Templates';

      const renameButton = document.createElement('button');
      renameButton.type = 'button';
      renameButton.dataset.templatePresetAction = 'rename';
      renameButton.dataset.templatePresetId = preset.id;
      renameButton.textContent = 'Rename';

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.dataset.templatePresetAction = 'remove';
      removeButton.dataset.templatePresetId = preset.id;
      removeButton.textContent = 'Delete';
      removeButton.disabled = preset.id === 'default';

      actions.append(applyButton, editButton, renameButton, removeButton);
      item.append(details, actions);
      this.elements.productTemplatePresetList.append(item);
    }
  }

  private syncViewWithState(): boolean {
    if (!this.ensureSelectionsAreValid()) {
      return false;
    }

    this.refreshTrackingSelect();
    this.refreshLocaleSelect();
    this.refreshListingSelect();
    this.refreshPresetSelect();
    this.refreshProductTemplatePresetSelect();
    this.refreshProductListOptionControls();
    this.refreshModeButtons();
    this.refreshPanelVisibility();
    this.refreshSessionSummary();
    this.refreshSessionPanelVisibility();

    return true;
  }

  private setStatus(message: string) {
    this.elements.status.textContent = message;
    this.elements.statusMini.textContent = message;
  }

  private resolveRuntimeSelection() {
    const state = this.store.getSnapshot().state;
    const tracking = this.getCurrentTracking();
    const locale = this.getCurrentLocale();
    const listing = this.getCurrentListing();

    if (!tracking || !locale) {
      throw new Error('Missing tracking or locale selection.');
    }

    return {
      state,
      tracking,
      locale,
      listing,
    };
  }

  private getAtomicInterface(): AtomicCommerceInterfaceElement {
    const commerceInterface = this.elements.atomicInterfaceRoot.querySelector(
      'atomic-commerce-interface'
    ) as AtomicCommerceInterfaceElement | null;

    if (!commerceInterface) {
      throw new Error('Atomic commerce interface was not rendered.');
    }

    return commerceInterface;
  }

  private buildAtomicProductTemplateNode(templateHtml: string): HTMLElement | null {
    const templateBody = this.extractTemplateBodyHtml(templateHtml);
    if (!templateBody) {
      return null;
    }

    const templateWrapper = document.createElement('atomic-product-template');
    templateWrapper.dataset.templateSource = 'custom';

    const htmlTemplate = document.createElement('template');
    htmlTemplate.innerHTML = templateBody;
    templateWrapper.append(htmlTemplate);

    return templateWrapper;
  }

  private extractTemplateBodyHtml(templateHtml: string): string {
    const trimmed = templateHtml.trim();
    if (!trimmed) {
      return '';
    }

    const parsed = document.createElement('template');
    parsed.innerHTML = trimmed;
    const rootElements = [...parsed.content.children];

    if (rootElements.length !== 1) {
      return trimmed;
    }

    const root = rootElements[0];
    if (!root) {
      return trimmed;
    }
    const tagName = root.tagName.toLowerCase();

    if (tagName === 'template') {
      return (root as HTMLTemplateElement).innerHTML.trim();
    }

    if (tagName !== 'atomic-product-template') {
      return trimmed;
    }

    const nestedTemplate = root.querySelector(':scope > template');
    if (nestedTemplate instanceof HTMLTemplateElement) {
      return nestedTemplate.innerHTML.trim();
    }

    return root.innerHTML.trim();
  }

  private clearInjectedTemplates(container: Element) {
    const injected = container.querySelectorAll<HTMLElement>(
      'atomic-product-template[data-template-source="custom"]'
    );
    for (const template of injected) {
      template.remove();
    }
  }

  private applyProductComponentCustomizations(state: TroubleshootState) {
    const productListTemplate = this.buildAtomicProductTemplateNode(
      state.productTemplates.productList
    );
    const instantProductsTemplate = this.buildAtomicProductTemplateNode(
      state.productTemplates.instantProducts
    );

    const productLists = this.elements.atomicInterfaceRoot.querySelectorAll<HTMLElement>(
      'atomic-commerce-product-list'
    );
    for (const productList of productLists) {
      productList.setAttribute('display', state.productListOptions.display);
      productList.setAttribute('density', state.productListOptions.density);
      productList.setAttribute('image-size', state.productListOptions.imageSize);
      this.clearInjectedTemplates(productList);
      if (productListTemplate) {
        productList.prepend(productListTemplate.cloneNode(true));
      }
    }

    const instantProducts = this.elements.atomicInterfaceRoot.querySelector<HTMLElement>(
      'atomic-commerce-search-box-instant-products'
    );
    if (instantProducts) {
      instantProducts.setAttribute('image-size', state.productListOptions.instantProductsImageSize);
      this.clearInjectedTemplates(instantProducts);
      if (instantProductsTemplate) {
        instantProducts.prepend(instantProductsTemplate.cloneNode(true));
      }
    }
  }

  private async applyTroubleshootingState(reason: string) {
    const applyToken = ++this.activeApplyToken;

    if (!this.syncViewWithState()) {
      this.syncViewWithState();
    }

    let modeForStatus: TroubleshootMode = this.store.getSnapshot().state.mode;

    try {
      const {state, tracking, locale, listing} = this.resolveRuntimeSelection();
      modeForStatus = state.mode;

      if (state.mode === 'listing' && !listing) {
        this.elements.result.textContent = safeStringify({
          reason,
          mode: state.mode,
          warning: 'No listing URL available for the selected tracking ID.',
          trackingId: tracking.trackingId,
          cmhRequestTrace: this.cmhService.getRequestTrace(),
        });
        this.setStatus(`No listing URLs found for tracking "${tracking.trackingId}".`);
        return;
      }

      this.setStatus(`Applying ${state.mode} interface (${reason})...`);

      this.elements.atomicInterfaceRoot.innerHTML = buildInterfaceMarkup(state.mode);
      this.applyProductComponentCustomizations(state);
      await ensureAtomicCommerceLoaded();
      if (applyToken !== this.activeApplyToken) {
        return;
      }

      await customElements.whenDefined('atomic-commerce-interface');
      if (applyToken !== this.activeApplyToken) {
        return;
      }

      const commerceInterface = this.getAtomicInterface();
      const engine = createTroubleshootEngine({
        organizationId: this.config.organizationId,
        engineAccessToken: this.config.engineAccessToken,
        trackingId: tracking.trackingId,
        mode: state.mode,
        locale,
        listing,
        advancedContext: state.advancedContext,
      });

      await commerceInterface.initializeWithEngine(engine);
      if (applyToken !== this.activeApplyToken) {
        return;
      }

      commerceInterface.executeFirstRequest();

      this.elements.result.textContent = safeStringify({
        reason,
        mode: state.mode,
        trackingId: tracking.trackingId,
        locale: {
          id: locale.id,
          language: locale.language,
          country: locale.country,
          currency: locale.currency,
          viewUrl: locale.viewUrl,
        },
        listing: listing ? {id: listing.id, url: listing.url} : null,
        productListOptions: state.productListOptions,
        selectedProductTemplatePresetId: state.selectedProductTemplatePresetId,
        productTemplates: {
          productListEnabled: state.productTemplates.productList.trim().length > 0,
          instantProductsEnabled: state.productTemplates.instantProducts.trim().length > 0,
        },
        advancedContext: state.advancedContext,
        cmhRequestTrace: this.cmhService.getRequestTrace(),
      });

      this.setStatus(
        `Applied ${tracking.trackingId} / ${locale.language}-${locale.country}-${locale.currency} / ${state.mode}.`
      );
    } catch (error) {
      if (applyToken !== this.activeApplyToken) {
        return;
      }

      const message = error instanceof Error ? error.message : 'Failed to apply troubleshoot state.';
      this.elements.result.textContent = safeStringify({
        reason,
        mode: modeForStatus,
        error: message,
        cmhRequestTrace: this.cmhService.getRequestTrace(),
        diagnostics: getAtomicAssetDiagnostics(),
      });
      this.setStatus(`Apply failed: ${message}`);
    }
  }
}
