import {describe, expect, it, vi} from 'vitest';
import {resolveHostedPageIdByName} from '../../../packages/commerce-troubleshoot-deployer/src/hosted-page-resolver';

function createJsonResponse(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  });
}

describe('hosted-page-resolver', () => {
  it('returns exact hosted page id by name from hostedpages/projects/pages', async () => {
    const fetchMock = vi.fn(async () =>
      createJsonResponse(200, {
        items: [
          {id: 'page-1', name: 'other-page'},
          {id: 'page-2', name: 'target-page'},
        ],
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    try {
      const pageId = await resolveHostedPageIdByName({
        organizationId: 'my-org',
        accessToken: 'platform-token',
        hostedPageName: 'target-page',
      });

      expect(pageId).toBe('page-2');
      const calls = fetchMock.mock.calls as unknown[][];
      expect(String(calls[0]?.[0])).toContain(
        '/rest/organizations/my-org/hostedpages/projects/pages?order=asc&perPage=100&page=0'
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('returns undefined when no exact hosted page name exists', async () => {
    const fetchMock = vi.fn(async () =>
      createJsonResponse(200, {
        items: [{id: 'page-1', name: 'different-name'}],
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    try {
      const pageId = await resolveHostedPageIdByName({
        organizationId: 'my-org',
        accessToken: 'platform-token',
        hostedPageName: 'target-page',
      });

      expect(pageId).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('selects the most recently modified page when multiple exact names exist', async () => {
    const fetchMock = vi.fn(async () =>
      createJsonResponse(200, {
        items: [
          {id: 'page-older', name: 'target-page', lastModified: '2024-01-01T00:00:00.000Z'},
          {id: 'page-newer', name: 'target-page', lastModified: '2025-01-01T00:00:00.000Z'},
        ],
      })
    );
    const logger = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    try {
      const pageId = await resolveHostedPageIdByName({
        organizationId: 'my-org',
        accessToken: 'platform-token',
        hostedPageName: 'target-page',
        logger,
      });

      expect(pageId).toBe('page-newer');
      expect(logger).toHaveBeenCalledWith(
        expect.stringContaining('Hosted page lookup found 2 exact matches')
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('falls back to /pages?name= when hostedpages/projects/pages is unavailable', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createJsonResponse(404, {
          message: 'No resource found at the provided URI.',
          errorCode: 'INVALID_URI',
        })
      )
      .mockResolvedValueOnce(
        createJsonResponse(200, {
          items: [{id: 'page-2', name: 'target-page'}],
        })
      );
    vi.stubGlobal('fetch', fetchMock);

    try {
      const pageId = await resolveHostedPageIdByName({
        organizationId: 'my-org',
        accessToken: 'platform-token',
        hostedPageName: 'target-page',
      });

      expect(pageId).toBe('page-2');
      const calls = fetchMock.mock.calls as unknown[][];
      expect(String(calls[0]?.[0])).toContain('/hostedpages/projects/pages');
      expect(String(calls[1]?.[0])).toContain('/rest/organizations/my-org/pages?name=target-page');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('treats "page name does not exist" fallback error as non-fatal', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createJsonResponse(404, {
          message: 'No resource found at the provided URI.',
          errorCode: 'INVALID_URI',
        })
      )
      .mockResolvedValueOnce(
        createJsonResponse(404, {
          errorCode: 404,
          message: "Page with name 'target-page' does not exist",
        })
      );
    vi.stubGlobal('fetch', fetchMock);

    try {
      const pageId = await resolveHostedPageIdByName({
        organizationId: 'my-org',
        accessToken: 'platform-token',
        hostedPageName: 'target-page',
      });

      expect(pageId).toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('retries lookup in allowed region when initial region is wrong', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        createJsonResponse(400, {
          message:
            "Organization: 'my-org' does not accept requests in current region 'us-east-2'. Allowed region(s): '[eu-west-1]'.",
          errorCode: 'INVALID_REQUEST',
        })
      )
      .mockResolvedValueOnce(
        createJsonResponse(200, {
          items: [{id: 'page-2', name: 'target-page'}],
        })
      );
    vi.stubGlobal('fetch', fetchMock);

    try {
      const pageId = await resolveHostedPageIdByName({
        organizationId: 'my-org',
        accessToken: 'platform-token',
        hostedPageName: 'target-page',
      });

      expect(pageId).toBe('page-2');
      const calls = fetchMock.mock.calls as unknown[][];
      expect(String(calls[0]?.[0])).toContain('https://platform.cloud.coveo.com');
      expect(String(calls[1]?.[0])).toContain('https://platform-eu.cloud.coveo.com');
      expect(String(calls[1]?.[0])).toContain('/hostedpages/projects/pages');
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
