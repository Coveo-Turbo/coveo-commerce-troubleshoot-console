export type TroubleshootMode = 'search' | 'listing';

export type AdvancedContext = {
  custom: Record<string, unknown>;
  dictionaryFieldContext: Record<string, unknown>;
};

export type ContextPreset = {
  id: string;
  label: string;
  advancedContext: AdvancedContext;
};

export type ProductTemplatePreset = {
  id: string;
  label: string;
  productTemplates: ProductTemplates;
};

export type TrackingLocale = {
  id: string;
  label: string;
  language: string;
  country: string;
  currency: string;
  viewUrl: string;
};

export type TrackingListing = {
  id: string;
  label: string;
  url: string;
};

export type TrackingData = {
  trackingId: string;
  locales: TrackingLocale[];
  listings: TrackingListing[];
};

export type ProductListDisplay = 'grid' | 'list';
export type ProductListDensity = 'compact' | 'normal' | 'comfortable';
export type ProductListImageSize = 'small' | 'large' | 'icon' | 'none';

export type ProductListOptions = {
  display: ProductListDisplay;
  density: ProductListDensity;
  imageSize: ProductListImageSize;
  instantProductsImageSize: ProductListImageSize;
};

export type ProductTemplates = {
  productList: string;
  instantProducts: string;
};

export type TroubleshootState = {
  mode: TroubleshootMode;
  selectedTrackingId: string;
  selectedLocaleId: string;
  selectedListingId: string;
  selectedContextPresetId: string;
  selectedProductTemplatePresetId: string;
  isTopPanelMinimized: boolean;
  isSessionPanelMinimized: boolean;
  productListOptions: ProductListOptions;
  productTemplates: ProductTemplates;
  advancedContext: AdvancedContext;
};

export type PersistedTroubleshootData = {
  version: number;
  state: Partial<TroubleshootState>;
  presets: ContextPreset[];
  productTemplatePresets: ProductTemplatePreset[];
};
