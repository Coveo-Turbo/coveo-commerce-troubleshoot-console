export type AppRuntimeConfig = {
  organizationId: string;
  engineAccessToken: string;
  cmhAccessToken: string;
  hostedPageName: string;
  hostedPageId?: string;
  defaults: {
    trackingId?: string;
    language: string;
    country: string;
    currency: string;
    viewUrl: string;
  };
};

export type ConfigDomain = 'ENGINE' | 'CMH';

export class ConfigDomainError extends Error {
  public readonly domain: ConfigDomain;

  public constructor(domain: ConfigDomain, message: string) {
    super(message);
    this.domain = domain;
    this.name = 'ConfigDomainError';
  }
}
