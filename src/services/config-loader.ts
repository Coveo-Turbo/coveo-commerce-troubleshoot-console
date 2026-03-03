import generatedConfig from '../app/runtime-config.generated';
import {AppRuntimeConfig, ConfigDomainError} from '../types/app-config';

type RuntimeDefaultsCandidate = {
  trackingId?: string;
  language?: string;
  country?: string;
  currency?: string;
  viewUrl?: string;
};

type RuntimeConfigCandidate = {
  organizationId?: string;
  engineAccessToken?: string;
  cmhAccessToken?: string;
  hostedPageName?: string;
  hostedPageId?: string;
  defaultProductTemplatePresetId?: string;
  defaults?: RuntimeDefaultsCandidate;
};

type WindowWithConfig = Window & {
  __APP_CONFIG?: RuntimeConfigCandidate;
};

const DEFAULT_LANGUAGE = 'en';
const DEFAULT_COUNTRY = 'US';
const DEFAULT_CURRENCY = 'USD';
const DEFAULT_VIEW_URL = 'https://www.example.com/';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeDefaults(input: RuntimeDefaultsCandidate | undefined): AppRuntimeConfig['defaults'] {
  const trackingId = readString(input?.trackingId);

  const defaults: AppRuntimeConfig['defaults'] = {
    language: readString(input?.language) || DEFAULT_LANGUAGE,
    country: readString(input?.country) || DEFAULT_COUNTRY,
    currency: readString(input?.currency) || DEFAULT_CURRENCY,
    viewUrl: readString(input?.viewUrl) || DEFAULT_VIEW_URL,
  };

  if (trackingId) {
    defaults.trackingId = trackingId;
  }

  return defaults;
}

function normalizeCandidate(candidate: RuntimeConfigCandidate): AppRuntimeConfig {
  const organizationId = readString(candidate.organizationId);
  const hostedPageName = readString(candidate.hostedPageName);
  const engineAccessToken = readString(candidate.engineAccessToken);
  const cmhAccessToken = readString(candidate.cmhAccessToken);
  const hostedPageId = readString(candidate.hostedPageId);
  const defaultProductTemplatePresetId = readString(candidate.defaultProductTemplatePresetId);
  const defaults = normalizeDefaults(candidate.defaults);

  if (!organizationId) {
    throw new Error('Missing required APP_ORGANIZATION_ID / organizationId.');
  }

  if (!hostedPageName) {
    throw new Error('Missing required APP_HOSTED_PAGE_NAME / hostedPageName.');
  }

  if (!engineAccessToken) {
    throw new ConfigDomainError(
      'ENGINE',
      'ENGINE initialization failed: missing APP_ENGINE_ACCESS_TOKEN / engineAccessToken.'
    );
  }

  if (!cmhAccessToken) {
    throw new ConfigDomainError(
      'CMH',
      'CMH initialization failed: missing APP_CMH_ACCESS_TOKEN / cmhAccessToken.'
    );
  }

  const config: AppRuntimeConfig = {
    organizationId,
    hostedPageName,
    engineAccessToken,
    cmhAccessToken,
    defaults,
  };

  if (hostedPageId) {
    config.hostedPageId = hostedPageId;
  }
  if (defaultProductTemplatePresetId) {
    config.defaultProductTemplatePresetId = defaultProductTemplatePresetId;
  }

  return config;
}

function getWindowConfig(): RuntimeConfigCandidate {
  if (typeof window === 'undefined') {
    return {};
  }

  const appWindow = window as WindowWithConfig;
  if (isRecord(appWindow.__APP_CONFIG)) {
    return appWindow.__APP_CONFIG;
  }

  return {};
}

function getViteEnvConfig(): RuntimeConfigCandidate {
  const viteEnv = (import.meta as {env?: Record<string, unknown>}).env ?? {};

  const defaults: RuntimeDefaultsCandidate = {};
  const trackingId = readString(viteEnv.APP_DEFAULT_TRACKING_ID);
  const language = readString(viteEnv.APP_DEFAULT_LANGUAGE);
  const country = readString(viteEnv.APP_DEFAULT_COUNTRY);
  const currency = readString(viteEnv.APP_DEFAULT_CURRENCY);
  const viewUrl = readString(viteEnv.APP_DEFAULT_VIEW_URL);

  if (trackingId) {
    defaults.trackingId = trackingId;
  }
  if (language) {
    defaults.language = language;
  }
  if (country) {
    defaults.country = country;
  }
  if (currency) {
    defaults.currency = currency;
  }
  if (viewUrl) {
    defaults.viewUrl = viewUrl;
  }

  const candidate: RuntimeConfigCandidate = {};
  const organizationId = readString(viteEnv.APP_ORGANIZATION_ID);
  const engineAccessToken = readString(viteEnv.APP_ENGINE_ACCESS_TOKEN);
  const cmhAccessToken = readString(viteEnv.APP_CMH_ACCESS_TOKEN);
  const hostedPageName = readString(viteEnv.APP_HOSTED_PAGE_NAME);
  const hostedPageId = readString(viteEnv.APP_HOSTED_PAGE_ID);
  const defaultProductTemplatePresetId = readString(viteEnv.APP_DEFAULT_PRODUCT_TEMPLATE_PRESET_ID);

  if (organizationId) {
    candidate.organizationId = organizationId;
  }
  if (engineAccessToken) {
    candidate.engineAccessToken = engineAccessToken;
  }
  if (cmhAccessToken) {
    candidate.cmhAccessToken = cmhAccessToken;
  }
  if (hostedPageName) {
    candidate.hostedPageName = hostedPageName;
  }
  if (hostedPageId) {
    candidate.hostedPageId = hostedPageId;
  }
  if (defaultProductTemplatePresetId) {
    candidate.defaultProductTemplatePresetId = defaultProductTemplatePresetId;
  }
  if (Object.keys(defaults).length > 0) {
    candidate.defaults = defaults;
  }

  return candidate;
}

function getGeneratedConfig(): RuntimeConfigCandidate {
  return isRecord(generatedConfig) ? (generatedConfig as RuntimeConfigCandidate) : {};
}

export function loadRuntimeConfig(overrides: RuntimeConfigCandidate = {}): AppRuntimeConfig {
  const generated = getGeneratedConfig();
  const viteEnv = getViteEnvConfig();
  const windowConfig = getWindowConfig();

  const mergedDefaults: RuntimeDefaultsCandidate = {
    ...generated.defaults,
    ...viteEnv.defaults,
    ...windowConfig.defaults,
    ...overrides.defaults,
  };

  const source: RuntimeConfigCandidate = {
    ...generated,
    ...viteEnv,
    ...windowConfig,
    ...overrides,
  };

  if (Object.keys(mergedDefaults).length > 0) {
    source.defaults = mergedDefaults;
  }

  return normalizeCandidate(source);
}
