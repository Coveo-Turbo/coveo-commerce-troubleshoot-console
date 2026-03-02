import generatedConfig from '../app/runtime-config.generated';
import {AppRuntimeConfig, ConfigDomainError} from '../types/app-config';

type RuntimeConfigCandidate = Partial<AppRuntimeConfig> & {
  defaults?: Partial<AppRuntimeConfig['defaults']>;
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

function normalizeDefaults(input: RuntimeConfigCandidate['defaults']): AppRuntimeConfig['defaults'] {
  return {
    trackingId: readString(input?.trackingId) || undefined,
    language: readString(input?.language) || DEFAULT_LANGUAGE,
    country: readString(input?.country) || DEFAULT_COUNTRY,
    currency: readString(input?.currency) || DEFAULT_CURRENCY,
    viewUrl: readString(input?.viewUrl) || DEFAULT_VIEW_URL,
  };
}

function normalizeCandidate(candidate: RuntimeConfigCandidate): AppRuntimeConfig {
  const organizationId = readString(candidate.organizationId);
  const hostedPageName = readString(candidate.hostedPageName);
  const engineAccessToken = readString(candidate.engineAccessToken);
  const cmhAccessToken = readString(candidate.cmhAccessToken);
  const hostedPageId = readString(candidate.hostedPageId) || undefined;
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

  return {
    organizationId,
    hostedPageName,
    hostedPageId,
    engineAccessToken,
    cmhAccessToken,
    defaults,
  };
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

function getGeneratedConfig(): RuntimeConfigCandidate {
  return isRecord(generatedConfig) ? (generatedConfig as RuntimeConfigCandidate) : {};
}

export function loadRuntimeConfig(overrides: RuntimeConfigCandidate = {}): AppRuntimeConfig {
  const source = {
    ...getGeneratedConfig(),
    ...getWindowConfig(),
    ...overrides,
    defaults: {
      ...getGeneratedConfig().defaults,
      ...getWindowConfig().defaults,
      ...overrides.defaults,
    },
  };

  return normalizeCandidate(source);
}
