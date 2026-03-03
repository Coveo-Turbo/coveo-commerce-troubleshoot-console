import {
  AdvancedContext,
  ContextPreset,
  PersistedTroubleshootData,
  ProductListDensity,
  ProductListDisplay,
  ProductListImageSize,
  ProductListOptions,
  ProductTemplatePreset,
  ProductTemplates,
  TroubleshootState,
} from '../types/troubleshoot';

type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

type StoreSnapshot = {
  state: TroubleshootState;
  presets: ContextPreset[];
  productTemplatePresets: ProductTemplatePreset[];
};

type StatePatch = Partial<TroubleshootState>;

type StoreSubscriber = (snapshot: StoreSnapshot) => void;

type StoreOptions = {
  defaults: TroubleshootState;
  defaultPresets?: ContextPreset[];
  defaultProductTemplatePresets?: ProductTemplatePreset[];
  storageKey?: string;
  storage?: StorageLike;
};

const STORAGE_KEY = 'coveo-commerce-troubleshoot-state-v1';
const STORAGE_VERSION = 1;
const DEFAULT_PRESET_ID = 'default';
const DEFAULT_PRODUCT_TEMPLATE_PRESET_ID = 'default';
const PRODUCT_LIST_DISPLAY_VALUES: ProductListDisplay[] = ['grid', 'list'];
const PRODUCT_LIST_DENSITY_VALUES: ProductListDensity[] = ['compact', 'normal', 'comfortable'];
const PRODUCT_LIST_IMAGE_SIZE_VALUES: ProductListImageSize[] = ['small', 'large', 'icon', 'none'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  return fallback;
}

function cloneAdvancedContext(context: AdvancedContext): AdvancedContext {
  return {
    custom: {...context.custom},
    dictionaryFieldContext: {...context.dictionaryFieldContext},
  };
}

function cloneProductListOptions(options: ProductListOptions): ProductListOptions {
  return {
    display: options.display,
    density: options.density,
    imageSize: options.imageSize,
    instantProductsImageSize: options.instantProductsImageSize,
  };
}

function cloneProductTemplates(templates: ProductTemplates): ProductTemplates {
  return {
    productList: templates.productList,
    instantProducts: templates.instantProducts,
  };
}

function cloneProductTemplatePreset(preset: ProductTemplatePreset): ProductTemplatePreset {
  return {
    id: preset.id,
    label: preset.label,
    productTemplates: cloneProductTemplates(preset.productTemplates),
  };
}

function cloneState(state: TroubleshootState): TroubleshootState {
  return {
    ...state,
    advancedContext: cloneAdvancedContext(state.advancedContext),
    productListOptions: cloneProductListOptions(state.productListOptions),
    productTemplates: cloneProductTemplates(state.productTemplates),
  };
}

function readEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  if (typeof value !== 'string') {
    return fallback;
  }
  return (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function normalizeProductListOptions(value: unknown, defaults: ProductListOptions): ProductListOptions {
  const input = isRecord(value) ? value : {};
  return {
    display: readEnum(input.display, PRODUCT_LIST_DISPLAY_VALUES, defaults.display),
    density: readEnum(input.density, PRODUCT_LIST_DENSITY_VALUES, defaults.density),
    imageSize: readEnum(input.imageSize, PRODUCT_LIST_IMAGE_SIZE_VALUES, defaults.imageSize),
    instantProductsImageSize: readEnum(
      input.instantProductsImageSize,
      PRODUCT_LIST_IMAGE_SIZE_VALUES,
      defaults.instantProductsImageSize
    ),
  };
}

function normalizeProductTemplates(value: unknown, defaults: ProductTemplates): ProductTemplates {
  if (!isRecord(value)) {
    return cloneProductTemplates(defaults);
  }

  return {
    productList: typeof value.productList === 'string' ? value.productList : defaults.productList,
    instantProducts:
      typeof value.instantProducts === 'string' ? value.instantProducts : defaults.instantProducts,
  };
}

function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}

export function resolveSafeStorage(): StorageLike {
  if (typeof window === 'undefined') {
    return createMemoryStorage();
  }

  try {
    const testKey = '__troubleshoot_storage_probe__';
    window.localStorage.setItem(testKey, 'ok');
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch {
    return createMemoryStorage();
  }
}

export function normalizeAdvancedContext(value: unknown): AdvancedContext {
  if (!isRecord(value)) {
    return {
      custom: {},
      dictionaryFieldContext: {},
    };
  }

  return {
    custom: normalizeRecord(value.custom),
    dictionaryFieldContext: normalizeRecord(value.dictionaryFieldContext),
  };
}

export function createDefaultPreset(): ContextPreset {
  return {
    id: DEFAULT_PRESET_ID,
    label: 'Default',
    advancedContext: {
      custom: {},
      dictionaryFieldContext: {},
    },
  };
}

export function createDefaultProductTemplatePreset(): ProductTemplatePreset {
  return {
    id: DEFAULT_PRODUCT_TEMPLATE_PRESET_ID,
    label: 'Atomic Default',
    productTemplates: {
      productList: '',
      instantProducts: '',
    },
  };
}

export function normalizeContextPreset(input: unknown, index = 0): ContextPreset | null {
  if (!isRecord(input)) {
    return null;
  }

  const id = toString(input.id) || `preset-${index + 1}`;
  const label = toString(input.label) || `Preset ${index + 1}`;
  const advancedContext = normalizeAdvancedContext(input.advancedContext);

  return {
    id,
    label,
    advancedContext,
  };
}

export function normalizeProductTemplatePreset(
  input: unknown,
  index = 0
): ProductTemplatePreset | null {
  if (!isRecord(input)) {
    return null;
  }

  const id = toString(input.id) || `product-template-preset-${index + 1}`;
  const label = toString(input.label) || `Product Template Preset ${index + 1}`;
  const productTemplates = normalizeProductTemplates(input.productTemplates, {
    productList: '',
    instantProducts: '',
  });

  return {
    id,
    label,
    productTemplates,
  };
}

function dedupePresets(presets: ContextPreset[]): ContextPreset[] {
  const unique = new Map<string, ContextPreset>();
  for (const preset of presets) {
    if (!unique.has(preset.id)) {
      unique.set(preset.id, preset);
    }
  }

  return [...unique.values()];
}

function ensureDefaultPreset(presets: ContextPreset[]): ContextPreset[] {
  if (presets.some((preset) => preset.id === DEFAULT_PRESET_ID)) {
    return presets;
  }

  return [createDefaultPreset(), ...presets];
}

function normalizePresets(input: unknown): ContextPreset[] {
  if (!Array.isArray(input)) {
    return [createDefaultPreset()];
  }

  const normalized: ContextPreset[] = [];
  for (const [index, candidate] of input.entries()) {
    const preset = normalizeContextPreset(candidate, index);
    if (preset) {
      normalized.push(preset);
    }
  }

  return ensureDefaultPreset(dedupePresets(normalized));
}

function dedupeProductTemplatePresets(presets: ProductTemplatePreset[]): ProductTemplatePreset[] {
  const unique = new Map<string, ProductTemplatePreset>();
  for (const preset of presets) {
    if (!unique.has(preset.id)) {
      unique.set(preset.id, cloneProductTemplatePreset(preset));
    }
  }

  return [...unique.values()];
}

function ensureDefaultProductTemplatePreset(
  presets: ProductTemplatePreset[]
): ProductTemplatePreset[] {
  if (presets.some((preset) => preset.id === DEFAULT_PRODUCT_TEMPLATE_PRESET_ID)) {
    return presets.map((preset) => cloneProductTemplatePreset(preset));
  }

  return [createDefaultProductTemplatePreset(), ...presets];
}

function normalizeProductTemplatePresets(input: unknown): ProductTemplatePreset[] {
  if (!Array.isArray(input)) {
    return [createDefaultProductTemplatePreset()];
  }

  const normalized: ProductTemplatePreset[] = [];
  for (const [index, candidate] of input.entries()) {
    const preset = normalizeProductTemplatePreset(candidate, index);
    if (preset) {
      normalized.push(preset);
    }
  }

  return ensureDefaultProductTemplatePreset(dedupeProductTemplatePresets(normalized));
}

function mergeProductTemplatePresetsWithLocalPriority(
  defaults: ProductTemplatePreset[],
  persisted: ProductTemplatePreset[]
): ProductTemplatePreset[] {
  const merged = new Map<string, ProductTemplatePreset>();
  for (const preset of defaults) {
    merged.set(preset.id, cloneProductTemplatePreset(preset));
  }
  for (const preset of persisted) {
    merged.set(preset.id, cloneProductTemplatePreset(preset));
  }

  return ensureDefaultProductTemplatePreset([...merged.values()]);
}

export function normalizeTroubleshootState(
  input: unknown,
  defaults: TroubleshootState,
  presets: ContextPreset[],
  productTemplatePresets: ProductTemplatePreset[]
): TroubleshootState {
  if (!isRecord(input)) {
    return {
      ...defaults,
      advancedContext: cloneAdvancedContext(defaults.advancedContext),
      productListOptions: cloneProductListOptions(defaults.productListOptions),
      productTemplates: cloneProductTemplates(defaults.productTemplates),
    };
  }

  const presetIds = new Set(presets.map((preset) => preset.id));
  const selectedContextPresetId = toString(input.selectedContextPresetId);
  const resolvedPresetId = presetIds.has(selectedContextPresetId)
    ? selectedContextPresetId
    : DEFAULT_PRESET_ID;
  const productTemplatePresetIds = new Set(productTemplatePresets.map((preset) => preset.id));
  const selectedProductTemplatePresetId = toString(input.selectedProductTemplatePresetId);
  const resolvedProductTemplatePresetId = productTemplatePresetIds.has(selectedProductTemplatePresetId)
    ? selectedProductTemplatePresetId
    : DEFAULT_PRODUCT_TEMPLATE_PRESET_ID;

  const mode = input.mode === 'listing' ? 'listing' : 'search';

  return {
    mode,
    selectedTrackingId: toString(input.selectedTrackingId) || defaults.selectedTrackingId,
    selectedLocaleId: toString(input.selectedLocaleId) || defaults.selectedLocaleId,
    selectedListingId: toString(input.selectedListingId) || defaults.selectedListingId,
    selectedContextPresetId: resolvedPresetId,
    selectedProductTemplatePresetId: resolvedProductTemplatePresetId,
    isTopPanelMinimized: readBoolean(input.isTopPanelMinimized, defaults.isTopPanelMinimized),
    isSessionPanelMinimized: readBoolean(
      input.isSessionPanelMinimized,
      defaults.isSessionPanelMinimized
    ),
    productListOptions: normalizeProductListOptions(input.productListOptions, defaults.productListOptions),
    productTemplates: normalizeProductTemplates(input.productTemplates, defaults.productTemplates),
    advancedContext: normalizeAdvancedContext(input.advancedContext),
  };
}

function parsePersisted(raw: string | null): PersistedTroubleshootData | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PersistedTroubleshootData;
    if (!isRecord(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function serializePersisted(snapshot: StoreSnapshot): PersistedTroubleshootData {
  return {
    version: STORAGE_VERSION,
    state: snapshot.state,
    presets: snapshot.presets,
    productTemplatePresets: snapshot.productTemplatePresets,
  };
}

export function createTroubleshootStateStore(options: StoreOptions) {
  const storage = options.storage ?? resolveSafeStorage();
  const storageKey = options.storageKey ?? STORAGE_KEY;
  const subscribers = new Set<StoreSubscriber>();

  const defaultPresets = ensureDefaultPreset(options.defaultPresets ?? [createDefaultPreset()]);
  const defaultProductTemplatePresets = ensureDefaultProductTemplatePreset(
    options.defaultProductTemplatePresets ?? [createDefaultProductTemplatePreset()]
  );
  const parsed = parsePersisted(storage.getItem(storageKey));
  const presets = normalizePresets(parsed?.presets ?? defaultPresets);
  const hasPersistedProductTemplatePresets = Array.isArray(parsed?.productTemplatePresets);
  const persistedProductTemplatePresets = hasPersistedProductTemplatePresets
    ? normalizeProductTemplatePresets(parsed?.productTemplatePresets)
    : [];
  const productTemplatePresets = hasPersistedProductTemplatePresets
    ? mergeProductTemplatePresetsWithLocalPriority(
        defaultProductTemplatePresets,
        persistedProductTemplatePresets
      )
    : defaultProductTemplatePresets.map((preset) => cloneProductTemplatePreset(preset));
  let snapshot: StoreSnapshot = {
    state: normalizeTroubleshootState(parsed?.state, options.defaults, presets, productTemplatePresets),
    presets,
    productTemplatePresets,
  };

  function persist() {
    storage.setItem(storageKey, JSON.stringify(serializePersisted(snapshot)));
  }

  function emit() {
    for (const subscriber of subscribers) {
      subscriber(snapshot);
    }
  }

  function setSnapshot(next: StoreSnapshot) {
    snapshot = {
      state: cloneState(next.state),
      presets: [...next.presets],
      productTemplatePresets: next.productTemplatePresets.map((preset) =>
        cloneProductTemplatePreset(preset)
      ),
    };
    persist();
    emit();
  }

  return {
    getSnapshot(): StoreSnapshot {
      return {
        state: cloneState(snapshot.state),
        presets: [...snapshot.presets],
        productTemplatePresets: snapshot.productTemplatePresets.map((preset) =>
          cloneProductTemplatePreset(preset)
        ),
      };
    },
    updateState(patch: StatePatch) {
      const nextState = normalizeTroubleshootState(
        {
          ...snapshot.state,
          ...patch,
          advancedContext: patch.advancedContext ?? snapshot.state.advancedContext,
        },
        options.defaults,
        snapshot.presets,
        snapshot.productTemplatePresets
      );

      setSnapshot({
        state: nextState,
        presets: snapshot.presets,
        productTemplatePresets: snapshot.productTemplatePresets,
      });
    },
    setAdvancedContext(context: AdvancedContext) {
      const normalized = normalizeAdvancedContext(context);
      setSnapshot({
        state: {
          ...snapshot.state,
          advancedContext: normalized,
        },
        presets: snapshot.presets,
        productTemplatePresets: snapshot.productTemplatePresets,
      });
    },
    upsertPreset(preset: ContextPreset) {
      const normalized = normalizeContextPreset(preset);
      if (!normalized) {
        return;
      }

      const next = snapshot.presets.filter((existing) => existing.id !== normalized.id);
      next.push(normalized);
      const withDefault = ensureDefaultPreset(next);

      setSnapshot({
        state: {
          ...snapshot.state,
          selectedContextPresetId: normalized.id,
        },
        presets: withDefault,
        productTemplatePresets: snapshot.productTemplatePresets,
      });
    },
    removePreset(id: string) {
      if (id === DEFAULT_PRESET_ID) {
        return;
      }

      const next = snapshot.presets.filter((preset) => preset.id !== id);
      const withDefault = ensureDefaultPreset(next);
      const selectedContextPresetId =
        snapshot.state.selectedContextPresetId === id
          ? DEFAULT_PRESET_ID
          : snapshot.state.selectedContextPresetId;

      setSnapshot({
        state: {
          ...snapshot.state,
          selectedContextPresetId,
        },
        presets: withDefault,
        productTemplatePresets: snapshot.productTemplatePresets,
      });
    },
    upsertProductTemplatePreset(preset: ProductTemplatePreset) {
      const normalized = normalizeProductTemplatePreset(preset);
      if (!normalized) {
        return;
      }

      const next = snapshot.productTemplatePresets.filter(
        (existing) => existing.id !== normalized.id
      );
      next.push(normalized);
      const withDefault = ensureDefaultProductTemplatePreset(next);

      setSnapshot({
        state: {
          ...snapshot.state,
          selectedProductTemplatePresetId: normalized.id,
          productTemplates: cloneProductTemplates(normalized.productTemplates),
        },
        presets: snapshot.presets,
        productTemplatePresets: withDefault,
      });
    },
    removeProductTemplatePreset(id: string) {
      if (id === DEFAULT_PRODUCT_TEMPLATE_PRESET_ID) {
        return;
      }

      const next = snapshot.productTemplatePresets.filter((preset) => preset.id !== id);
      const withDefault = ensureDefaultProductTemplatePreset(next);

      const fallbackPreset =
        withDefault.find((preset) => preset.id === DEFAULT_PRODUCT_TEMPLATE_PRESET_ID) ?? withDefault[0];
      const selectedProductTemplatePresetId =
        snapshot.state.selectedProductTemplatePresetId === id
          ? fallbackPreset?.id ?? DEFAULT_PRODUCT_TEMPLATE_PRESET_ID
          : snapshot.state.selectedProductTemplatePresetId;

      const selectedPreset = withDefault.find(
        (preset) => preset.id === selectedProductTemplatePresetId
      );

      setSnapshot({
        state: {
          ...snapshot.state,
          selectedProductTemplatePresetId,
          productTemplates: selectedPreset
            ? cloneProductTemplates(selectedPreset.productTemplates)
            : cloneProductTemplates(snapshot.state.productTemplates),
        },
        presets: snapshot.presets,
        productTemplatePresets: withDefault,
      });
    },
    reset() {
      storage.removeItem(storageKey);
      const nextPresets = ensureDefaultPreset(options.defaultPresets ?? [createDefaultPreset()]);
      const nextProductTemplatePresets = ensureDefaultProductTemplatePreset(
        options.defaultProductTemplatePresets ?? [createDefaultProductTemplatePreset()]
      );
      setSnapshot({
        state: normalizeTroubleshootState(
          options.defaults,
          options.defaults,
          nextPresets,
          nextProductTemplatePresets
        ),
        presets: nextPresets,
        productTemplatePresets: nextProductTemplatePresets,
      });
    },
    subscribe(subscriber: StoreSubscriber) {
      subscribers.add(subscriber);
      return () => {
        subscribers.delete(subscriber);
      };
    },
  };
}

export type TroubleshootStateStore = ReturnType<typeof createTroubleshootStateStore>;
