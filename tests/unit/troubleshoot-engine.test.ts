import {describe, expect, it, vi} from 'vitest';

const {buildCommerceEngineMock} = vi.hoisted(() => ({
  buildCommerceEngineMock: vi.fn((...args: unknown[]) => {
    void args;
    return {id: 'mock-engine'};
  }),
}));

vi.mock('@coveo/headless/commerce', () => ({
  buildCommerceEngine: buildCommerceEngineMock,
}));

import {createTroubleshootEngine} from '../../src/app/troubleshoot-engine';

describe('troubleshoot-engine', () => {
  it('builds commerce engine config with token separation and locale context', async () => {
    createTroubleshootEngine({
      organizationId: 'my-org',
      engineAccessToken: 'engine-token',
      trackingId: 'storefront-a',
      mode: 'search',
      locale: {
        id: 'en-us-usd',
        label: 'English US',
        language: 'en',
        country: 'US',
        currency: 'USD',
        viewUrl: 'https://example.com/search',
      },
      listing: undefined,
      advancedContext: {
        custom: {
          channel: 'web',
          dictionaryFieldContext: {
            static: 'yes',
          },
        },
        dictionaryFieldContext: {
          dynamic: 'yes',
        },
      },
    });

    expect(buildCommerceEngineMock).toHaveBeenCalledTimes(1);

    const firstCall = (buildCommerceEngineMock.mock.calls as unknown[][])[0];
    expect(firstCall).toBeDefined();

    const argument = firstCall?.[0] as {
      configuration: {
        accessToken: string;
        organizationId: string;
        analytics: {trackingId: string};
        context: Record<string, unknown>;
        preprocessRequest: (
          request: {body?: unknown},
          clientOrigin: string
        ) => Promise<{body?: unknown}>;
      };
    };

    expect(argument.configuration.organizationId).toBe('my-org');
    expect(argument.configuration.accessToken).toBe('engine-token');
    expect(argument.configuration.analytics.trackingId).toBe('storefront-a');
    expect(argument.configuration.context.language).toBe('en');
    expect(argument.configuration.context.country).toBe('US');
    expect(argument.configuration.context.currency).toBe('USD');

    const request = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        trackingId: 'storefront-a',
        context: {
          dictionaryFieldContext: {
            fromPayload: 'true',
          },
        },
      }),
    };

    const processed = await argument.configuration.preprocessRequest(request, 'commerceApiFetch');
    const payload = JSON.parse(String(processed.body)) as {
      language: string;
      country: string;
      currency: string;
      context: {
        dictionaryFieldContext: Record<string, string>;
      };
    };

    expect(payload.language).toBe('en');
    expect(payload.country).toBe('US');
    expect(payload.currency).toBe('USD');
    expect(payload.context.dictionaryFieldContext).toEqual({
      fromPayload: 'true',
      static: 'yes',
      dynamic: 'yes',
    });
  });

  it('sets productListing URL when mode is listing', () => {
    createTroubleshootEngine({
      organizationId: 'my-org',
      engineAccessToken: 'engine-token',
      trackingId: 'storefront-a',
      mode: 'listing',
      locale: {
        id: 'en-us-usd',
        label: 'English US',
        language: 'en',
        country: 'US',
        currency: 'USD',
        viewUrl: 'https://example.com/default-listing',
      },
      listing: {
        id: 'cat-bikes',
        label: 'Bikes',
        url: 'https://example.com/c/bikes',
      },
      advancedContext: {
        custom: {},
        dictionaryFieldContext: {},
      },
    });

    const calls = buildCommerceEngineMock.mock.calls as unknown[][];
    const lastCall = calls[calls.length - 1];
    expect(lastCall).toBeDefined();

    const argument = lastCall?.[0] as {
      configuration: {
        productListing: {url: string};
      };
    };

    expect(argument.configuration.productListing.url).toBe('https://example.com/c/bikes');
  });
});
