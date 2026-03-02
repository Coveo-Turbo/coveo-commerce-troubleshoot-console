import template from '../templates/troubleshoot.html?raw';
import type {AppRuntimeConfig} from '../types/app-config';
import type {
  AdvancedContext,
  ContextPreset,
  TrackingData,
  TrackingListing,
  TrackingLocale,
  TroubleshootMode,
  TroubleshootState,
} from '../types/troubleshoot';
import type {CmhConfigService} from '../services/cmh-config-service';
import type {TroubleshootEngine} from './troubleshoot-engine';
import type {TroubleshootStateStore} from '../state/troubleshoot-state';

type TroubleshootPageDependencies = {
  mount: HTMLElement;
  config: AppRuntimeConfig;
  cmhService: CmhConfigService;
  engine: TroubleshootEngine;
  store: TroubleshootStateStore;
};

type RequiredElements = {
  panelControls: HTMLElement;
  panelToggleButton: HTMLButtonElement;
  trackingSelect: HTMLSelectElement;
  localeSelect: HTMLSelectElement;
  listingSelect: HTMLSelectElement;
  listingFilterInput: HTMLInputElement;
  presetSelect: HTMLSelectElement;
  queryInput: HTMLInputElement;
  modeButtons: HTMLButtonElement[];
  runButton: HTMLButtonElement;
  resetButton: HTMLButtonElement;
  openAdvancedButton: HTMLButtonElement;
  openPresetsButton: HTMLButtonElement;
  modePill: HTMLElement;
  trackingPill: HTMLElement;
  localePill: HTMLElement;
  listingPill: HTMLElement;
  searchRow: HTMLElement;
  listingRow: HTMLElement;
  searchUrl: HTMLElement;
  listingUrl: HTMLElement;
  status: HTMLElement;
  result: HTMLElement;
  advancedDialog: HTMLDialogElement;
  presetsDialog: HTMLDialogElement;
  customContextTextarea: HTMLTextAreaElement;
  dictionaryContextTextarea: HTMLTextAreaElement;
  advancedError: HTMLElement;
  applyAdvancedButton: HTMLButtonElement;
  presetList: HTMLElement;
  addPresetButton: HTMLButtonElement;
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

export class TroubleshootPage {
  private readonly mount: HTMLElement;
  private readonly config: AppRuntimeConfig;
  private readonly cmhService: CmhConfigService;
  private readonly engine: TroubleshootEngine;
  private readonly store: TroubleshootStateStore;

  private trackingData: TrackingData[] = [];
  private elements!: RequiredElements;

  public constructor(dependencies: TroubleshootPageDependencies) {
    this.mount = dependencies.mount;
    this.config = dependencies.config;
    this.cmhService = dependencies.cmhService;
    this.engine = dependencies.engine;
    this.store = dependencies.store;
  }

  public async init() {
    this.mount.innerHTML = template;
    this.cacheElements();
    this.wireEvents();

    this.store.subscribe(() => {
      this.syncViewWithState();
    });

    this.setStatus('Loading tracking mappings...');

    try {
      const trackingData = await this.cmhService.getTrackingData();
      this.trackingData = trackingData.length > 0 ? trackingData : createFallbackTrackingData(this.config);
    } catch {
      this.trackingData = createFallbackTrackingData(this.config);
      this.setStatus('Failed to discover CMH config. Running with default profile locale/tracking.');
    }

    this.syncViewWithState();
    await this.executeCurrentRequest('initialization');
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
      trackingSelect: this.mustQuery<HTMLSelectElement>('[data-control="tracking"]'),
      localeSelect: this.mustQuery<HTMLSelectElement>('[data-control="locale"]'),
      listingSelect: this.mustQuery<HTMLSelectElement>('[data-control="listing"]'),
      listingFilterInput: this.mustQuery<HTMLInputElement>('[data-control="listing-filter"]'),
      presetSelect: this.mustQuery<HTMLSelectElement>('[data-control="preset"]'),
      queryInput: this.mustQuery<HTMLInputElement>('[data-control="query"]'),
      modeButtons: [...this.mount.querySelectorAll<HTMLButtonElement>('[data-mode]')],
      runButton: this.mustQuery<HTMLButtonElement>('[data-action="run-request"]'),
      resetButton: this.mustQuery<HTMLButtonElement>('[data-action="reset-state"]'),
      openAdvancedButton: this.mustQuery<HTMLButtonElement>('[data-action="open-advanced"]'),
      openPresetsButton: this.mustQuery<HTMLButtonElement>('[data-action="open-presets"]'),
      modePill: this.mustQuery<HTMLElement>('[data-field="mode-pill"]'),
      trackingPill: this.mustQuery<HTMLElement>('[data-field="tracking-pill"]'),
      localePill: this.mustQuery<HTMLElement>('[data-field="locale-pill"]'),
      listingPill: this.mustQuery<HTMLElement>('[data-field="listing-pill"]'),
      searchRow: this.mustQuery<HTMLElement>('[data-field="search-row"]'),
      listingRow: this.mustQuery<HTMLElement>('[data-field="listing-row"]'),
      searchUrl: this.mustQuery<HTMLElement>('[data-field="search-url"]'),
      listingUrl: this.mustQuery<HTMLElement>('[data-field="listing-url"]'),
      status: this.mustQuery<HTMLElement>('[data-field="status"]'),
      result: this.mustQuery<HTMLElement>('[data-field="result"]'),
      advancedDialog: this.mustQuery<HTMLDialogElement>('[data-modal="advanced-context"]'),
      presetsDialog: this.mustQuery<HTMLDialogElement>('[data-modal="manage-presets"]'),
      customContextTextarea: this.mustQuery<HTMLTextAreaElement>('[data-field="custom-context"]'),
      dictionaryContextTextarea: this.mustQuery<HTMLTextAreaElement>('[data-field="dictionary-context"]'),
      advancedError: this.mustQuery<HTMLElement>('[data-field="advanced-error"]'),
      applyAdvancedButton: this.mustQuery<HTMLButtonElement>('[data-action="apply-advanced"]'),
      presetList: this.mustQuery<HTMLElement>('[data-role="preset-list"]'),
      addPresetButton: this.mustQuery<HTMLButtonElement>('[data-action="add-preset"]'),
    };
  }

  private wireEvents() {
    this.elements.panelToggleButton.addEventListener('click', () => {
      const current = this.store.getSnapshot().state.isTopPanelMinimized;
      this.store.updateState({isTopPanelMinimized: !current});
    });

    this.elements.trackingSelect.addEventListener('change', async () => {
      this.store.updateState({
        selectedTrackingId: this.elements.trackingSelect.value,
        selectedLocaleId: '',
        selectedListingId: '',
      });
      await this.executeCurrentRequest('tracking changed');
    });

    this.elements.localeSelect.addEventListener('change', async () => {
      this.store.updateState({selectedLocaleId: this.elements.localeSelect.value});
      await this.executeCurrentRequest('locale changed');
    });

    this.elements.listingFilterInput.addEventListener('input', () => {
      this.refreshListingSelect();
    });

    this.elements.listingSelect.addEventListener('change', async () => {
      this.store.updateState({selectedListingId: this.elements.listingSelect.value});
      await this.executeCurrentRequest('listing changed');
    });

    this.elements.queryInput.addEventListener('keydown', async (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        await this.executeCurrentRequest('query submitted');
      }
    });

    for (const modeButton of this.elements.modeButtons) {
      modeButton.addEventListener('click', async () => {
        const mode = modeButton.dataset.mode === 'listing' ? 'listing' : 'search';
        this.store.updateState({mode});
        await this.executeCurrentRequest('mode changed');
      });
    }

    this.elements.presetSelect.addEventListener('change', async () => {
      const presetId = this.elements.presetSelect.value;
      const preset = this.getPresetById(presetId);
      this.store.updateState({selectedContextPresetId: presetId});
      if (preset) {
        this.store.setAdvancedContext(preset.advancedContext);
      }
      await this.executeCurrentRequest('preset changed');
    });

    this.elements.openAdvancedButton.addEventListener('click', () => {
      const {advancedContext} = this.store.getSnapshot().state;
      this.elements.customContextTextarea.value = safeStringify(advancedContext.custom);
      this.elements.dictionaryContextTextarea.value = safeStringify(
        advancedContext.dictionaryFieldContext
      );
      this.clearAdvancedError();
      this.elements.advancedDialog.showModal();
    });

    this.elements.applyAdvancedButton.addEventListener('click', async () => {
      try {
        const nextContext: AdvancedContext = {
          custom: parseJsonObject(this.elements.customContextTextarea.value),
          dictionaryFieldContext: parseJsonObject(this.elements.dictionaryContextTextarea.value),
        };

        this.store.setAdvancedContext(nextContext);
        this.elements.advancedDialog.close();
        this.clearAdvancedError();
        await this.executeCurrentRequest('advanced context updated');
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
        this.store.updateState({selectedContextPresetId: preset.id});
        this.store.setAdvancedContext(preset.advancedContext);
        this.executeCurrentRequest('preset applied').catch(() => undefined);
      }

      if (action === 'rename') {
        const nextLabel = window.prompt('Preset label', preset.label)?.trim();
        if (!nextLabel) {
          return;
        }
        this.store.upsertPreset({...preset, label: nextLabel});
      }

      if (action === 'remove') {
        const confirmed = window.confirm(`Delete preset "${preset.label}"?`);
        if (!confirmed) {
          return;
        }
        this.store.removePreset(preset.id);
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

    this.elements.runButton.addEventListener('click', async () => {
      await this.executeCurrentRequest('manual run');
    });

    this.elements.resetButton.addEventListener('click', async () => {
      this.elements.listingFilterInput.value = '';
      this.store.reset();
      await this.executeCurrentRequest('state reset');
    });
  }

  private clearAdvancedError() {
    this.elements.advancedError.hidden = true;
    this.elements.advancedError.textContent = '';
  }

  private getCurrentTracking(): TrackingData | undefined {
    const {selectedTrackingId} = this.store.getSnapshot().state;
    return this.trackingData.find((tracking) => tracking.trackingId === selectedTrackingId);
  }

  private getCurrentLocale(): TrackingLocale | undefined {
    const currentTracking = this.getCurrentTracking();
    const {selectedLocaleId} = this.store.getSnapshot().state;
    return currentTracking?.locales.find((locale) => locale.id === selectedLocaleId);
  }

  private getCurrentListing(): TrackingListing | undefined {
    const currentTracking = this.getCurrentTracking();
    const {selectedListingId} = this.store.getSnapshot().state;
    return currentTracking?.listings.find((listing) => listing.id === selectedListingId);
  }

  private getPresetById(id: string): ContextPreset | undefined {
    return this.store.getSnapshot().presets.find((preset) => preset.id === id);
  }

  private ensureSelectionsAreValid() {
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
        (tracking) => tracking.trackingId === (patch.selectedTrackingId ?? snapshot.state.selectedTrackingId)
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

  private refreshModeButtons() {
    const mode = this.store.getSnapshot().state.mode;
    for (const button of this.elements.modeButtons) {
      const isActive = (button.dataset.mode ?? 'search') === mode;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    }
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

      actions.append(applyButton, renameButton, removeButton);
      item.append(details, actions);
      this.elements.presetList.append(item);
    }
  }

  private syncViewWithState() {
    if (!this.ensureSelectionsAreValid()) {
      return;
    }

    this.refreshTrackingSelect();
    this.refreshLocaleSelect();
    this.refreshListingSelect();
    this.refreshPresetSelect();
    this.refreshModeButtons();
    this.refreshPanelVisibility();
    this.refreshSessionSummary();
  }

  private setStatus(message: string) {
    this.elements.status.textContent = message;
  }

  private buildRequestPayload(mode: TroubleshootMode) {
    const snapshot = this.store.getSnapshot();
    const tracking = this.getCurrentTracking();
    const locale = this.getCurrentLocale();
    const listing = this.getCurrentListing();

    if (!tracking || !locale) {
      throw new Error('Missing tracking or locale selection.');
    }

    return {
      mode,
      trackingId: tracking.trackingId,
      locale,
      listingId: listing?.id,
      listingUrl: listing?.url,
      query: this.elements.queryInput.value,
      advancedContext: snapshot.state.advancedContext,
    };
  }

  private async executeCurrentRequest(reason: string) {
    const mode = this.store.getSnapshot().state.mode;

    try {
      this.setStatus(`Running ${mode} request (${reason})...`);
      const payload = this.buildRequestPayload(mode);
      const result = await this.engine.execute(payload);
      this.elements.result.textContent = safeStringify({
        reason,
        mode,
        endpoint: result.endpoint,
        status: result.status,
        request: result.request,
        response: result.response,
      });
      this.setStatus(`Completed ${mode} request (${result.status}).`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown execution failure.';
      this.elements.result.textContent = safeStringify({
        reason,
        mode,
        error: message,
      });
      this.setStatus(`Request failed: ${message}`);
    }
  }
}
