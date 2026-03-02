import {describe, expect, it} from 'vitest';
import {
  createDefaultPreset,
  createTroubleshootStateStore,
  normalizeAdvancedContext,
  resolveSafeStorage,
} from '../../src/state/troubleshoot-state';
import type {TroubleshootState} from '../../src/types/troubleshoot';

function createMemoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      map.set(key, value);
    },
    removeItem: (key: string) => {
      map.delete(key);
    },
  };
}

const defaults: TroubleshootState = {
  mode: 'search',
  selectedTrackingId: 'tracking-a',
  selectedLocaleId: 'en-us-usd',
  selectedListingId: '',
  selectedContextPresetId: 'default',
  isTopPanelMinimized: false,
  advancedContext: {
    custom: {},
    dictionaryFieldContext: {},
  },
};

describe('troubleshoot-state', () => {
  it('normalizes invalid advanced context values', () => {
    expect(normalizeAdvancedContext(null)).toEqual({
      custom: {},
      dictionaryFieldContext: {},
    });

    expect(normalizeAdvancedContext({custom: 'bad'})).toEqual({
      custom: {},
      dictionaryFieldContext: {},
    });
  });

  it('persists and reloads state + presets', () => {
    const storage = createMemoryStorage();
    const store = createTroubleshootStateStore({
      defaults,
      storage,
      defaultPresets: [createDefaultPreset()],
    });

    store.updateState({
      selectedTrackingId: 'tracking-b',
      selectedLocaleId: 'fr-ca-cad',
      isTopPanelMinimized: true,
    });

    store.upsertPreset({
      id: 'ops',
      label: 'Ops',
      advancedContext: {
        custom: {channel: 'ops'},
        dictionaryFieldContext: {brand: 'x'},
      },
    });

    const reloaded = createTroubleshootStateStore({
      defaults,
      storage,
      defaultPresets: [createDefaultPreset()],
    });

    expect(reloaded.getSnapshot().state.selectedTrackingId).toBe('tracking-b');
    expect(reloaded.getSnapshot().state.isTopPanelMinimized).toBe(true);
    expect(reloaded.getSnapshot().presets.some((preset) => preset.id === 'ops')).toBe(true);
  });

  it('falls back to memory storage when localStorage is inaccessible', () => {
    const originalWindow = (globalThis as {window?: unknown}).window;

    (globalThis as {window?: unknown}).window = {
      localStorage: {
        getItem() {
          throw new Error('blocked');
        },
        setItem() {
          throw new Error('blocked');
        },
        removeItem() {
          throw new Error('blocked');
        },
      },
    };

    const storage = resolveSafeStorage();

    expect(() => {
      storage.setItem('k', 'v');
      storage.getItem('k');
      storage.removeItem('k');
    }).not.toThrow();

    (globalThis as {window?: unknown}).window = originalWindow;
  });
});
