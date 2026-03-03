import {describe, expect, it} from 'vitest';
import {loadRuntimeConfig} from '../../src/services/config-loader';
import {ConfigDomainError} from '../../src/types/app-config';

const validConfig = {
  organizationId: 'my-org',
  engineAccessToken: 'engine-token',
  cmhAccessToken: 'cmh-token',
  hostedPageName: 'my-hosted-page',
  defaults: {
    language: 'en',
    country: 'US',
    currency: 'USD',
    viewUrl: 'https://www.example.com/',
  },
};

describe('config-loader', () => {
  it('loads a valid config', () => {
    const config = loadRuntimeConfig(validConfig);
    expect(config.organizationId).toBe('my-org');
    expect(config.engineAccessToken).toBe('engine-token');
    expect(config.cmhAccessToken).toBe('cmh-token');
  });

  it('loads default product template preset id when provided', () => {
    const config = loadRuntimeConfig({
      ...validConfig,
      defaultProductTemplatePresetId: 'atomic-custom-1',
    });

    expect(config.defaultProductTemplatePresetId).toBe('atomic-custom-1');
  });

  it('throws ENGINE domain error when engine token is missing', () => {
    expect(() =>
      loadRuntimeConfig({
        ...validConfig,
        engineAccessToken: '',
      })
    ).toThrowError(ConfigDomainError);

    try {
      loadRuntimeConfig({
        ...validConfig,
        engineAccessToken: '',
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigDomainError);
      expect((error as ConfigDomainError).domain).toBe('ENGINE');
    }
  });

  it('throws CMH domain error when cmh token is missing', () => {
    expect(() =>
      loadRuntimeConfig({
        ...validConfig,
        cmhAccessToken: '',
      })
    ).toThrowError(ConfigDomainError);

    try {
      loadRuntimeConfig({
        ...validConfig,
        cmhAccessToken: '',
      });
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigDomainError);
      expect((error as ConfigDomainError).domain).toBe('CMH');
    }
  });

  it('fills optional defaults when missing', () => {
    const config = loadRuntimeConfig({
      organizationId: 'my-org',
      hostedPageName: 'my-hosted-page',
      engineAccessToken: 'engine-token',
      cmhAccessToken: 'cmh-token',
      defaults: {
        language: '',
      },
    });

    expect(config.defaults.language).toBe('en');
    expect(config.defaults.country).toBe('US');
    expect(config.defaults.currency).toBe('USD');
    expect(config.defaults.viewUrl).toContain('https://');
  });
});
