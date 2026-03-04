import {describe, expect, it, vi} from 'vitest';
import {CmhConfigService} from '../../src/services/cmh-config-service';

function createJsonResponse(status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  });
}

describe('cmh-config-service', () => {
  it('invokes fetch with window/global scope to avoid illegal invocation', async () => {
    const fetchLike = vi.fn(function (this: unknown, input: URL | RequestInfo) {
      if (this !== globalThis) {
        throw new TypeError('Illegal invocation');
      }

      const url = String(input);
      if (url.includes('/trackingidcatalogmappings')) {
        return Promise.resolve(createJsonResponse(200, {items: []}));
      }
      if (url.includes('/listings/pages')) {
        return Promise.resolve(createJsonResponse(200, {items: []}));
      }

      return Promise.resolve(createJsonResponse(404, {message: 'unknown'}));
    });

    const service = new CmhConfigService({
      organizationId: 'my-org',
      accessToken: 'cmh-token',
      defaults: {
        language: 'en',
        country: 'US',
        currency: 'USD',
        viewUrl: 'https://example.com/',
      },
      fetchImpl: fetchLike as unknown as typeof fetch,
    });

    await expect(service.getTrackingData()).resolves.toBeDefined();
    expect(fetchLike).toHaveBeenCalled();
  });

  it('calls discovery endpoints without unscoped listings pages requests', async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo) => {
      const url = String(input);
      if (url.includes('?page=')) {
        return createJsonResponse(400, {message: 'page is not supported'});
      }

      if (url.includes('/trackingidcatalogmappings')) {
        return createJsonResponse(200, {
          items: [
            {
              trackingId: 'storefront-us',
              locales: [
                {
                  id: 'en-us-usd',
                  language: 'en',
                  country: 'US',
                  currency: 'USD',
                  viewUrl: 'https://example.com/',
                },
              ],
            },
          ],
        });
      }

      if (url.includes('/listings/pages?trackingId=storefront-us')) {
        return createJsonResponse(200, {
          items: [],
        });
      }

      return createJsonResponse(404, {message: 'unknown'});
    });

    const service = new CmhConfigService({
      organizationId: 'my-org',
      accessToken: 'cmh-token',
      defaults: {
        language: 'en',
        country: 'US',
        currency: 'USD',
        viewUrl: 'https://example.com/',
      },
      fetchImpl: fetchMock as typeof fetch,
    });

    const result = await service.getTrackingData();
    expect(result.length).toBeGreaterThan(0);

    const urls = (fetchMock.mock.calls as unknown[][]).map((call) => String(call[0]));
    expect(urls).toContain(
      'https://platform.cloud.coveo.com/rest/organizations/my-org/trackingidcatalogmappings'
    );
    expect(urls).toContain(
      'https://platform.cloud.coveo.com/rest/organizations/my-org/commerce/v2/listings/pages?trackingId=storefront-us'
    );
    expect(urls).not.toContain(
      'https://platform.cloud.coveo.com/rest/organizations/my-org/commerce/v2/listings/pages'
    );
    expect(urls.some((url) => url.includes('/configurations/search'))).toBe(false);
    expect(urls.some((url) => url.includes('/configurations/listings'))).toBe(false);
    expect(urls.some((url) => url.includes('?page='))).toBe(false);
  });

  it('parses trackingidcatalogmappings as primary discovery source', async () => {
    const fetchMock = vi.fn(async (...args: unknown[]) => {
      void args;
      return createJsonResponse(200, {
        items: [
          {
            trackingId: 'storefront-us',
            locales: [
              {
                id: 'en-us-usd',
                label: 'English US',
                language: 'en',
                country: 'US',
                currency: 'USD',
                viewUrl: 'https://example.com/',
              },
            ],
            listings: [
              {
                id: 'listing-a',
                label: 'Listing A',
                url: 'https://example.com/c/a',
              },
            ],
          },
        ],
      });
    });

    const service = new CmhConfigService({
      organizationId: 'my-org',
      accessToken: 'cmh-token',
      defaults: {
        language: 'en',
        country: 'US',
        currency: 'USD',
        viewUrl: 'https://example.com/',
      },
      fetchImpl: fetchMock as typeof fetch,
    });

    const result = await service.getTrackingData();

    expect(result).toHaveLength(1);
    expect(result[0]?.trackingId).toBe('storefront-us');
    expect(result[0]?.locales[0]?.id).toBe('en-us-usd');
    expect(result[0]?.listings[0]?.id).toBe('listing-a');

    const mappingCall = (fetchMock.mock.calls as unknown[][]).find((call) =>
      String(call[0]).includes('/trackingidcatalogmappings')
    );
    expect(mappingCall).toBeDefined();

    const requestInit = (mappingCall?.[1] as RequestInit | undefined) ?? {};
    expect((requestInit.headers as Record<string, string>).Authorization).toBe('Bearer cmh-token');
  });

  it('parses locales from trackingIdToCatalogMapping with searchPageUri', async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo) => {
      const url = String(input);
      if (url.includes('/trackingidcatalogmappings')) {
        return createJsonResponse(200, {
          items: [
            {
              trackingId: 'storefront-eu',
              trackingIdToCatalogMapping: [
                {
                  language: 'fr',
                  country: 'FR',
                  currency: 'EUR',
                  searchPageUri: 'https://example.com/fr/fr/search',
                },
              ],
            },
          ],
        });
      }

      return createJsonResponse(200, {items: []});
    });

    const service = new CmhConfigService({
      organizationId: 'my-org',
      accessToken: 'cmh-token',
      defaults: {
        language: 'en',
        country: 'US',
        currency: 'USD',
        viewUrl: 'https://example.com/',
      },
      fetchImpl: fetchMock as typeof fetch,
    });

    const result = await service.getTrackingData();
    const eu = result.find((entry) => entry.trackingId === 'storefront-eu');

    expect(eu).toBeDefined();
    expect(eu?.locales[0]?.id).toBe('fr-fr-eur');
    expect(eu?.locales[0]?.viewUrl).toBe('https://example.com/fr/fr/search');
  });

  it('keeps tracking IDs from sparse catalog mappings and uses them for scoped listing page calls', async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo) => {
      const url = String(input);
      if (url.includes('/trackingidcatalogmappings')) {
        return createJsonResponse(200, {
          items: [{trackingId: 'sparse-tracking'}],
        });
      }

      if (url.includes('/commerce/v2/listings/pages?trackingId=sparse-tracking')) {
        return createJsonResponse(200, {
          items: [{name: 'Sparse Listing', matching: {url: '/sparse-listing'}}],
        });
      }

      return createJsonResponse(404, {message: 'unknown'});
    });

    const service = new CmhConfigService({
      organizationId: 'my-org',
      accessToken: 'cmh-token',
      defaults: {
        language: 'en',
        country: 'US',
        currency: 'USD',
        viewUrl: 'https://example.com/',
      },
      fetchImpl: fetchMock as typeof fetch,
    });

    const result = await service.getTrackingData();
    const sparse = result.find((entry) => entry.trackingId === 'sparse-tracking');

    expect(sparse).toBeDefined();
    expect(sparse?.listings.some((listing) => listing.id === 'sparse-listing')).toBe(true);

    const urls = (fetchMock.mock.calls as unknown[][]).map((call) => String(call[0]));
    expect(urls).toContain(
      'https://platform.cloud.coveo.com/rest/organizations/my-org/commerce/v2/listings/pages?trackingId=sparse-tracking'
    );
  });

  it('falls back to tracking-scoped listing pages endpoint when primary mapping is unavailable', async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo) => {
      const url = String(input);
      if (url.includes('/trackingidcatalogmappings')) {
        return createJsonResponse(500, {message: 'error'});
      }

      if (url.includes('/commerce/v2/listings/pages?trackingId=fallback-1')) {
        return createJsonResponse(200, {
          items: [{id: 'listing-x', name: 'Listing X', url: '/x'}],
        });
      }

      return createJsonResponse(404, {message: 'unknown'});
    });

    const service = new CmhConfigService({
      organizationId: 'my-org',
      accessToken: 'cmh-token',
      defaults: {
        trackingId: 'fallback-1',
        language: 'en',
        country: 'US',
        currency: 'USD',
        viewUrl: 'https://example.com/',
      },
      fetchImpl: fetchMock as typeof fetch,
    });

    const result = await service.getTrackingData();

    expect(result.map((entry) => entry.trackingId).sort()).toEqual(['fallback-1']);
    const fallbackOne = result.find((entry) => entry.trackingId === 'fallback-1');
    expect(fallbackOne?.listings[0]?.id).toBe('listing-x');
  });

  it('issues tracking-scoped listing page fallback requests and attributes rows missing trackingId', async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo) => {
      const url = String(input);

      if (url.includes('/trackingidcatalogmappings')) {
        return createJsonResponse(500, {message: 'error'});
      }

      if (url.includes('/commerce/v2/listings/pages?trackingId=fallback-1')) {
        return createJsonResponse(200, {
          items: [{id: 'listing-scoped', name: 'Scoped Listing', url: '/scoped'}],
        });
      }

      if (url.includes('/commerce/v2/listings/pages')) {
        return createJsonResponse(200, {
          items: [],
        });
      }

      return createJsonResponse(404, {message: 'unknown'});
    });

    const service = new CmhConfigService({
      organizationId: 'my-org',
      accessToken: 'cmh-token',
      defaults: {
        trackingId: 'fallback-1',
        language: 'en',
        country: 'US',
        currency: 'USD',
        viewUrl: 'https://example.com/',
      },
      fetchImpl: fetchMock as typeof fetch,
    });

    const result = await service.getTrackingData();
    const fallbackOne = result.find((entry) => entry.trackingId === 'fallback-1');

    expect(fallbackOne).toBeDefined();
    expect(fallbackOne?.listings.some((listing) => listing.id === 'listing-scoped')).toBe(true);

    const urls = (fetchMock.mock.calls as unknown[][]).map((call) => String(call[0]));
    expect(urls).toContain(
      'https://platform.cloud.coveo.com/rest/organizations/my-org/commerce/v2/listings/pages?trackingId=fallback-1'
    );
    expect(urls.some((url) => url.includes('/configurations/search'))).toBe(false);
    expect(urls.some((url) => url.includes('/configurations/listings'))).toBe(false);
  });

  it('uses region-specific platform host for EU and CA regions', async () => {
    const fetchMock = vi.fn(async () => createJsonResponse(200, {items: []}));

    const euService = new CmhConfigService({
      organizationId: 'my-org',
      accessToken: 'cmh-token',
      region: 'eu-west-1',
      defaults: {
        language: 'en',
        country: 'GB',
        currency: 'GBP',
        viewUrl: 'https://example.co.uk/',
      },
      fetchImpl: fetchMock as typeof fetch,
    });

    await euService.getTrackingData();
    const euFirstUrl = String((fetchMock.mock.calls as unknown[][])[0]?.[0] ?? '');
    expect(euFirstUrl).toContain('https://platform-eu.cloud.coveo.com');

    fetchMock.mockClear();

    const caService = new CmhConfigService({
      organizationId: 'my-org',
      accessToken: 'cmh-token',
      region: 'ca-central-1',
      defaults: {
        language: 'en',
        country: 'CA',
        currency: 'CAD',
        viewUrl: 'https://example.ca/',
      },
      fetchImpl: fetchMock as typeof fetch,
    });

    await caService.getTrackingData();
    const caFirstUrl = String((fetchMock.mock.calls as unknown[][])[0]?.[0] ?? '');
    expect(caFirstUrl).toContain('https://platform-ca.cloud.coveo.com');
  });

  it('defaults to US platform host for us region', async () => {
    const fetchMock = vi.fn(async () => createJsonResponse(200, {items: []}));

    const service = new CmhConfigService({
      organizationId: 'my-org',
      accessToken: 'cmh-token',
      region: 'us-east-2',
      defaults: {
        language: 'en',
        country: 'US',
        currency: 'USD',
        viewUrl: 'https://example.com/',
      },
      fetchImpl: fetchMock as typeof fetch,
    });

    await service.getTrackingData();

    const firstUrl = String((fetchMock.mock.calls as unknown[][])[0]?.[0] ?? '');
    expect(firstUrl).toContain('https://platform.cloud.coveo.com');
  });

  it('retries on allowed-region mismatch response', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createJsonResponse(400, {
          message:
            "Organization: 'my-org' does not accept requests in current region 'us-east-2'. Allowed region(s): '[eu-west-1]'.",
          errorCode: 'INVALID_REQUEST',
        })
      )
      .mockResolvedValue(createJsonResponse(200, {items: []}));

    const service = new CmhConfigService({
      organizationId: 'my-org',
      accessToken: 'cmh-token',
      defaults: {
        language: 'en',
        country: 'US',
        currency: 'USD',
        viewUrl: 'https://example.com/',
      },
      fetchImpl: fetchMock as typeof fetch,
    });

    await service.getTrackingData();

    const urls = (fetchMock.mock.calls as unknown[][]).map((call) => String(call[0]));
    expect(urls[0]).toContain('https://platform.cloud.coveo.com');
    expect(urls[1]).toContain('https://platform-eu.cloud.coveo.com');
  });
});
