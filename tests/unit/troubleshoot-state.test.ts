import {describe, expect, it} from 'vitest';
import {
  createDefaultProductTemplatePreset,
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
  selectedProductTemplatePresetId: 'default',
  isTopPanelMinimized: false,
  isSessionPanelMinimized: true,
  productListOptions: {
    display: 'grid',
    density: 'compact',
    imageSize: 'small',
    instantProductsImageSize: 'small',
  },
  productTemplates: {
    productList: '',
    instantProducts: '',
  },
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
      defaultProductTemplatePresets: [createDefaultProductTemplatePreset()],
    });

    store.updateState({
      selectedTrackingId: 'tracking-b',
      selectedLocaleId: 'fr-ca-cad',
      isTopPanelMinimized: true,
      isSessionPanelMinimized: false,
      productListOptions: {
        display: 'list',
        density: 'comfortable',
        imageSize: 'icon',
        instantProductsImageSize: 'large',
      },
      productTemplates: {
        productList: '<div>Product Template</div>',
        instantProducts: '<div>Instant Template</div>',
      },
    });

    store.upsertPreset({
      id: 'ops',
      label: 'Ops',
      advancedContext: {
        custom: {channel: 'ops'},
        dictionaryFieldContext: {brand: 'x'},
      },
    });

    store.upsertProductTemplatePreset({
      id: 'qa-template',
      label: 'QA Template',
      productTemplates: {
        productList: '<div>QA Product</div>',
        instantProducts: '<div>QA Instant</div>',
      },
    });

    const reloaded = createTroubleshootStateStore({
      defaults,
      storage,
      defaultPresets: [createDefaultPreset()],
      defaultProductTemplatePresets: [createDefaultProductTemplatePreset()],
    });

    expect(reloaded.getSnapshot().state.selectedTrackingId).toBe('tracking-b');
    expect(reloaded.getSnapshot().state.isTopPanelMinimized).toBe(true);
    expect(reloaded.getSnapshot().state.isSessionPanelMinimized).toBe(false);
    expect(reloaded.getSnapshot().state.productListOptions.display).toBe('list');
    expect(reloaded.getSnapshot().state.productTemplates.instantProducts).toContain('Instant');
    expect(reloaded.getSnapshot().presets.some((preset) => preset.id === 'ops')).toBe(true);
    expect(reloaded.getSnapshot().state.selectedProductTemplatePresetId).toBe('qa-template');
    expect(
      reloaded.getSnapshot().productTemplatePresets.some((preset) => preset.id === 'qa-template')
    ).toBe(true);
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

  it('merges repo product template presets while keeping localStorage overrides', () => {
    const storage = createMemoryStorage();
    const storageKey = 'merge-product-template-presets';

    storage.setItem(
      storageKey,
      JSON.stringify({
        version: 1,
        state: {
          selectedProductTemplatePresetId: 'default',
        },
        presets: [createDefaultPreset()],
        productTemplatePresets: [
          {
            id: 'default',
            label: 'Atomic Default',
            productTemplates: {
              productList: '<div>Local Default Product</div>',
              instantProducts: '<div>Local Default Instant</div>',
            },
          },
          {
            id: 'local-only',
            label: 'Local Only',
            productTemplates: {
              productList: '<div>Local Only Product</div>',
              instantProducts: '<div>Local Only Instant</div>',
            },
          },
        ],
      })
    );

    const store = createTroubleshootStateStore({
      defaults,
      storage,
      storageKey,
      defaultPresets: [createDefaultPreset()],
      defaultProductTemplatePresets: [
        createDefaultProductTemplatePreset(),
        {
          id: 'atomic-custom-1',
          label: 'Atomic Custom 1',
          productTemplates: {
            productList: '<div>Repo Custom Product</div>',
            instantProducts: '<div>Repo Custom Instant</div>',
          },
        },
      ],
    });

    const snapshot = store.getSnapshot();
    const defaultPreset = snapshot.productTemplatePresets.find((preset) => preset.id === 'default');

    expect(defaultPreset?.productTemplates.productList).toContain('Local Default Product');
    expect(snapshot.productTemplatePresets.some((preset) => preset.id === 'atomic-custom-1')).toBe(true);
    expect(snapshot.productTemplatePresets.some((preset) => preset.id === 'local-only')).toBe(true);
  });
});
