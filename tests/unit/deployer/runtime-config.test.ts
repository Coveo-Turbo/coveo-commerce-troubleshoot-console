import {describe, expect, it} from 'vitest';
import {
  buildRuntimeConfigPayload,
  normalizeRuntimeDefaults,
  serializeWindowRuntimeConfig,
} from '../../../packages/commerce-troubleshoot-deployer/src/runtime-config';

describe('runtime-config', () => {
  it('normalizes defaults with expected fallbacks', () => {
    expect(normalizeRuntimeDefaults(undefined)).toEqual({
      language: 'en',
      country: 'US',
      currency: 'USD',
      viewUrl: 'https://www.example.com/',
    });
  });

  it('builds payload with optional fields', () => {
    const payload = buildRuntimeConfigPayload({
      organizationId: 'my-org',
      region: 'eu-west-1',
      hostedPageName: 'my-page',
      hostedPageId: 'a-page-id',
      defaultProductTemplatePresetId: 'default',
      engineAccessToken: 'engine',
      cmhAccessToken: 'cmh',
      defaults: {
        trackingId: 'tracking',
        language: 'fr',
        country: 'CA',
        currency: 'CAD',
        viewUrl: 'https://example.com/fr',
      },
    });

    expect(payload).toEqual({
      organizationId: 'my-org',
      region: 'eu-west-1',
      hostedPageName: 'my-page',
      hostedPageId: 'a-page-id',
      defaultProductTemplatePresetId: 'default',
      engineAccessToken: 'engine',
      cmhAccessToken: 'cmh',
      defaults: {
        trackingId: 'tracking',
        language: 'fr',
        country: 'CA',
        currency: 'CAD',
        viewUrl: 'https://example.com/fr',
      },
    });
  });

  it('serializes runtime config into window assignment', () => {
    const content = serializeWindowRuntimeConfig({
      organizationId: 'org',
      hostedPageName: 'page',
      engineAccessToken: 'engine',
      cmhAccessToken: 'cmh',
      defaults: {
        language: 'en',
        country: 'US',
        currency: 'USD',
        viewUrl: 'https://example.com',
      },
    });

    expect(content).toContain('window.__APP_CONFIG =');
    expect(content).toContain('"organizationId": "org"');
  });
});
