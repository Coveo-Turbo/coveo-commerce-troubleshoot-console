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

export type TroubleshootState = {
  mode: TroubleshootMode;
  selectedTrackingId: string;
  selectedLocaleId: string;
  selectedListingId: string;
  selectedContextPresetId: string;
  isTopPanelMinimized: boolean;
  advancedContext: AdvancedContext;
};

export type PersistedTroubleshootData = {
  version: number;
  state: Partial<TroubleshootState>;
  presets: ContextPreset[];
};
