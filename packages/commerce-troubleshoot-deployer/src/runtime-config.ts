import type {RuntimeConfigPayload, RuntimeDefaults} from './types.js';

const DEFAULT_LANGUAGE = 'en';
const DEFAULT_COUNTRY = 'US';
const DEFAULT_CURRENCY = 'USD';
const DEFAULT_VIEW_URL = 'https://www.example.com/';

function toString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function normalizeRuntimeDefaults(defaults: RuntimeDefaults | undefined) {
  const language = toString(defaults?.language) || DEFAULT_LANGUAGE;
  const country = toString(defaults?.country) || DEFAULT_COUNTRY;
  const currency = toString(defaults?.currency) || DEFAULT_CURRENCY;
  const viewUrl = toString(defaults?.viewUrl) || DEFAULT_VIEW_URL;
  const trackingId = toString(defaults?.trackingId);

  return {
    language,
    country,
    currency,
    viewUrl,
    ...(trackingId ? {trackingId} : {}),
  };
}

export function buildRuntimeConfigPayload(input: {
  organizationId: string;
  region?: string;
  hostedPageName: string;
  hostedPageId?: string;
  defaultProductTemplatePresetId?: string;
  engineAccessToken: string;
  cmhAccessToken: string;
  defaults?: RuntimeDefaults;
}): RuntimeConfigPayload {
  const defaults = normalizeRuntimeDefaults(input.defaults);

  const payload: RuntimeConfigPayload = {
    organizationId: input.organizationId,
    hostedPageName: input.hostedPageName,
    engineAccessToken: input.engineAccessToken,
    cmhAccessToken: input.cmhAccessToken,
    defaults,
  };

  if (input.region?.trim()) {
    payload.region = input.region.trim();
  }

  if (input.hostedPageId?.trim()) {
    payload.hostedPageId = input.hostedPageId.trim();
  }

  if (input.defaultProductTemplatePresetId?.trim()) {
    payload.defaultProductTemplatePresetId = input.defaultProductTemplatePresetId.trim();
  }

  return payload;
}

export function serializeWindowRuntimeConfig(payload: RuntimeConfigPayload): string {
  return `window.__APP_CONFIG = ${JSON.stringify(payload, null, 2)};\n`;
}

export function serializeGeneratedRuntimeConfigTs(payload: RuntimeConfigPayload): string {
  return `import type {AppRuntimeConfig} from '../types/app-config';\n\nconst generatedConfig: Partial<AppRuntimeConfig> = ${JSON.stringify(
    payload,
    null,
    2
  )};\n\nexport default generatedConfig;\n`;
}
