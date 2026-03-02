import {
  AdvancedContext,
  ContextPreset,
  PersistedTroubleshootData,
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
};

type StatePatch = Partial<TroubleshootState>;

type StoreSubscriber = (snapshot: StoreSnapshot) => void;

type StoreOptions = {
  defaults: TroubleshootState;
  defaultPresets?: ContextPreset[];
  storageKey?: string;
  storage?: StorageLike;
};

const STORAGE_KEY = 'coveo-commerce-troubleshoot-state-v1';
const STORAGE_VERSION = 1;
const DEFAULT_PRESET_ID = 'default';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function cloneAdvancedContext(context: AdvancedContext): AdvancedContext {
  return {
    custom: {...context.custom},
    dictionaryFieldContext: {...context.dictionaryFieldContext},
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

export function normalizeTroubleshootState(
  input: unknown,
  defaults: TroubleshootState,
  presets: ContextPreset[]
): TroubleshootState {
  if (!isRecord(input)) {
    return {
      ...defaults,
      advancedContext: cloneAdvancedContext(defaults.advancedContext),
    };
  }

  const presetIds = new Set(presets.map((preset) => preset.id));
  const selectedContextPresetId = toString(input.selectedContextPresetId);
  const resolvedPresetId = presetIds.has(selectedContextPresetId)
    ? selectedContextPresetId
    : DEFAULT_PRESET_ID;

  const mode = input.mode === 'listing' ? 'listing' : 'search';

  return {
    mode,
    selectedTrackingId: toString(input.selectedTrackingId) || defaults.selectedTrackingId,
    selectedLocaleId: toString(input.selectedLocaleId) || defaults.selectedLocaleId,
    selectedListingId: toString(input.selectedListingId) || defaults.selectedListingId,
    selectedContextPresetId: resolvedPresetId,
    isTopPanelMinimized: Boolean(input.isTopPanelMinimized),
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
  };
}

export function createTroubleshootStateStore(options: StoreOptions) {
  const storage = options.storage ?? resolveSafeStorage();
  const storageKey = options.storageKey ?? STORAGE_KEY;
  const subscribers = new Set<StoreSubscriber>();

  const defaultPresets = ensureDefaultPreset(options.defaultPresets ?? [createDefaultPreset()]);
  const parsed = parsePersisted(storage.getItem(storageKey));
  const presets = normalizePresets(parsed?.presets ?? defaultPresets);
  let snapshot: StoreSnapshot = {
    state: normalizeTroubleshootState(parsed?.state, options.defaults, presets),
    presets,
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
      state: {
        ...next.state,
        advancedContext: cloneAdvancedContext(next.state.advancedContext),
      },
      presets: [...next.presets],
    };
    persist();
    emit();
  }

  return {
    getSnapshot(): StoreSnapshot {
      return {
        state: {
          ...snapshot.state,
          advancedContext: cloneAdvancedContext(snapshot.state.advancedContext),
        },
        presets: [...snapshot.presets],
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
        snapshot.presets
      );

      setSnapshot({
        state: nextState,
        presets: snapshot.presets,
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
      });
    },
    reset() {
      storage.removeItem(storageKey);
      const nextPresets = ensureDefaultPreset(options.defaultPresets ?? [createDefaultPreset()]);
      setSnapshot({
        state: normalizeTroubleshootState(options.defaults, options.defaults, nextPresets),
        presets: nextPresets,
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
