import {describe, expect, it, vi} from 'vitest';
import {createTroubleshootEngine} from '../../src/app/troubleshoot-engine';

describe('troubleshoot-engine', () => {
  it('uses engine token only and merges dictionaryFieldContext in request context', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ok: true}), {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      })
    );

    const engine = createTroubleshootEngine({
      organizationId: 'my-org',
      engineAccessToken: 'engine-token',
      fetchImpl: fetchMock as typeof fetch,
    });

    await engine.execute({
      mode: 'search',
      trackingId: 'tracking-1',
      locale: {
        id: 'en-us-usd',
        label: 'English',
        language: 'en',
        country: 'US',
        currency: 'USD',
        viewUrl: 'https://example.com/',
      },
      advancedContext: {
        custom: {
          dictionaryFieldContext: {
            base: 'base',
          },
          channel: 'web',
        },
        dictionaryFieldContext: {
          override: 'override',
        },
      },
      query: 'shoes',
    });

    const [, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = requestInit.headers as Record<string, string>;
    const body = JSON.parse(String(requestInit.body)) as {
      context: {dictionaryFieldContext: Record<string, string>; channel: string};
    };

    expect(headers.Authorization).toBe('Bearer engine-token');
    expect(body.context.channel).toBe('web');
    expect(body.context.dictionaryFieldContext).toEqual({
      base: 'base',
      override: 'override',
    });
  });
});
