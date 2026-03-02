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
  it('parses trackingidcatalogmappings as primary discovery source', async () => {
    const fetchMock = vi.fn(async () =>
      createJsonResponse(200, {
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
      })
    );

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

    const requestInit = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect((requestInit.headers as Record<string, string>).Authorization).toBe('Bearer cmh-token');
  });

  it('falls back to listing/search config endpoints when primary mapping is unavailable', async () => {
    const fetchMock = vi.fn(async (input: URL | RequestInfo) => {
      const url = String(input);
      if (url.includes('/trackingidcatalogmappings')) {
        return createJsonResponse(500, {message: 'error'});
      }

      if (url.includes('/configurations/listings')) {
        return createJsonResponse(200, {
          items: [{trackingId: 'fallback-1'}],
        });
      }

      if (url.includes('/configurations/search')) {
        return createJsonResponse(200, {
          items: [{trackingId: 'fallback-2', language: 'fr', country: 'CA', currency: 'CAD'}],
        });
      }

      if (url.includes('/listings/pages')) {
        return createJsonResponse(200, {
          items: [{trackingId: 'fallback-1', id: 'listing-x', name: 'Listing X', url: '/x'}],
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

    expect(result.map((entry) => entry.trackingId).sort()).toEqual(['fallback-1', 'fallback-2']);
    const fallbackOne = result.find((entry) => entry.trackingId === 'fallback-1');
    expect(fallbackOne?.listings[0]?.id).toBe('listing-x');
  });
});
