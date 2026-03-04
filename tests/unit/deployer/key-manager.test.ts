import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {describe, expect, it, vi} from 'vitest';
import {resolveAccessTokens} from '../../../packages/commerce-troubleshoot-deployer/src/key-manager';

function createClientMock(overrides = {}) {
  return {
    apiKey: {
      list: vi.fn(async () => []),
      get: vi.fn(async (id: string) => ({id, value: ''})),
      create: vi.fn(async (model, options) => ({
        id: `${model.displayName}-id`,
        displayName: model.displayName,
        value: `${model.displayName}-token`,
        options,
      })),
    },
    apiKeyTemplate: {
      listAPIKeysEligibility: vi.fn(async () => []),
    },
    organization: {
      listApiKeysPrivileges: vi.fn(async () => []),
    },
    ...overrides,
  };
}

describe('key-manager', () => {
  it('uses provided keys without calling platform client', async () => {
    const clientFactory = vi.fn(() => createClientMock());

    const result = await resolveAccessTokens({
      organizationId: 'my-org',
      accessToken: 'platform-token',
      keyStrategy: {
        mode: 'provided',
        engineAccessToken: 'engine',
      },
      clientFactory,
    });

    expect(result.engineAccessToken).toBe('engine');
    expect(result.cmhAccessToken).toBe('engine');
    expect(result.keyInfo.source).toBe('provided');
    expect(clientFactory).not.toHaveBeenCalled();
  });

  it('reuses existing managed keys when available with value', async () => {
    const client = createClientMock({
      apiKey: {
        list: vi.fn(async () => [
          {
            id: 'engine-id',
            displayName: 'ctc-engine-my-org',
            value: 'engine-token',
            createdDate: Date.now(),
            enabled: true,
          },
          {
            id: 'cmh-id',
            displayName: 'ctc-cmh-my-org',
            value: 'cmh-token',
            createdDate: Date.now(),
            enabled: true,
          },
        ]),
        get: vi.fn(async (id: string) => ({id, value: ''})),
        create: vi.fn(async (model) => ({
          id: `${model.displayName}-id`,
          value: `${model.displayName}-token`,
        })),
      },
    });

    const result = await resolveAccessTokens({
      organizationId: 'my-org',
      accessToken: 'platform-token',
      keyStrategy: {
        mode: 'managed',
      },
      clientFactory: vi.fn(() => client),
    });

    expect(result.engineAccessToken).toBe('engine-token');
    expect(result.cmhAccessToken).toBe('cmh-token');
    expect(result.keyInfo.reused).toBe(true);
    expect(client.apiKey.create).not.toHaveBeenCalled();
  });

  it('does not reuse masked key values and creates new managed keys', async () => {
    const now = Date.now();
    const client = createClientMock({
      apiKey: {
        list: vi.fn(async () => [
          {
            id: 'engine-id',
            displayName: 'ctc-engine-my-org',
            value: 'xx*****00b6',
            createdDate: now,
            enabled: true,
          },
          {
            id: 'cmh-id',
            displayName: 'ctc-cmh-my-org',
            value: 'yy*****88ab',
            createdDate: now,
            enabled: true,
          },
        ]),
        get: vi.fn(async (id: string) => ({id, value: 'zz*****4455'})),
        create: vi.fn(async (model, options) => ({
          id: `${model.displayName}-id`,
          displayName: model.displayName,
          value: `${model.displayName}-token`,
          options,
        })),
      },
      apiKeyTemplate: {
        listAPIKeysEligibility: vi.fn(async () => [{id: 'AnonymousSearch', canGenerate: true}]),
      },
      organization: {
        listApiKeysPrivileges: vi.fn(async () => [
          {
            owner: 'CATALOG',
            targetDomain: 'CATALOG',
            level: 'VIEW',
          },
          {
            owner: 'MERCHANDISING_HUB',
            targetDomain: 'MERCHANDISING_HUB',
            targetId: 'ALL',
            level: 'VIEW',
          },
          {
            owner: 'COMMERCE',
            targetDomain: 'PRODUCT_LISTING',
            level: 'VIEW',
          },
          {
            owner: 'ORGANIZATION',
            targetDomain: 'ORGANIZATION',
            level: 'VIEW',
          },
        ]),
      },
    });

    const result = await resolveAccessTokens({
      organizationId: 'my-org',
      accessToken: 'platform-token',
      keyStrategy: {
        mode: 'managed',
      },
      clientFactory: vi.fn(() => client),
    });

    expect(result.engineAccessToken).toBe('ctc-engine-my-org-token');
    expect(result.cmhAccessToken).toBe('ctc-cmh-my-org-token');
    expect(result.keyInfo.created).toBe(true);
    expect(client.apiKey.create).toHaveBeenCalledTimes(2);
  });

  it('reuses managed keys from cache when API key values are masked', async () => {
    const cacheDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ctc-key-cache-'));
    const cacheFilePath = path.join(cacheDir, 'managed-keys.json');
    const now = Date.now();

    await fs.writeFile(
      cacheFilePath,
      JSON.stringify(
        {
          version: 1,
          organizations: {
            'my-org': {
              'ctc-engine-my-org': {
                keyId: 'engine-id',
                token: 'engine-token-cached',
                updatedAt: now,
              },
              'ctc-cmh-my-org': {
                keyId: 'cmh-id',
                token: 'cmh-token-cached',
                updatedAt: now,
              },
            },
          },
        },
        null,
        2
      )
    );

    const client = createClientMock({
      apiKey: {
        list: vi.fn(async () => [
          {
            id: 'engine-id',
            displayName: 'ctc-engine-my-org',
            value: 'xx*****00b6',
            createdDate: now,
            enabled: true,
          },
          {
            id: 'cmh-id',
            displayName: 'ctc-cmh-my-org',
            value: 'yy*****88ab',
            createdDate: now,
            enabled: true,
          },
        ]),
        get: vi.fn(async (id: string) => ({id, value: 'zz*****4455'})),
        create: vi.fn(async (model, options) => ({
          id: `${model.displayName}-id`,
          displayName: model.displayName,
          value: `${model.displayName}-token`,
          options,
        })),
      },
    });

    const result = await resolveAccessTokens({
      organizationId: 'my-org',
      accessToken: 'platform-token',
      cacheFilePath,
      keyStrategy: {
        mode: 'managed',
      },
      clientFactory: vi.fn(() => client),
    });

    expect(result.engineAccessToken).toBe('engine-token-cached');
    expect(result.cmhAccessToken).toBe('cmh-token-cached');
    expect(result.keyInfo.reused).toBe(true);
    expect(result.keyInfo.created).toBe(false);
    expect(client.apiKey.create).not.toHaveBeenCalled();
  });

  it('creates engine and cmh keys when reuse is unavailable', async () => {
    const client = createClientMock({
      apiKeyTemplate: {
        listAPIKeysEligibility: vi.fn(async () => [{id: 'AnonymousSearch', canGenerate: true}]),
      },
      organization: {
        listApiKeysPrivileges: vi.fn(async () => [
          {
            owner: 'CATALOG',
            targetDomain: 'CATALOG',
            level: 'VIEW',
          },
          {
            owner: 'MERCHANDISING_HUB',
            targetDomain: 'MERCHANDISING_HUB',
            level: 'VIEW_ALL',
          },
          {
            owner: 'COMMERCE',
            targetDomain: 'PRODUCT_LISTING',
            level: 'VIEW',
          },
          {
            owner: 'ORGANIZATION',
            targetDomain: 'ORGANIZATION',
            level: 'VIEW',
          },
        ]),
      },
    });

    const result = await resolveAccessTokens({
      organizationId: 'my-org',
      accessToken: 'platform-token',
      keyStrategy: {
        mode: 'managed',
      },
      clientFactory: vi.fn(() => client),
    });

    expect(result.engineAccessToken).toBe('ctc-engine-my-org-token');
    expect(result.cmhAccessToken).toBe('ctc-cmh-my-org-token');
    expect(result.keyInfo.created).toBe(true);
    expect(client.apiKey.create).toHaveBeenCalledTimes(2);
    const cmhCall = client.apiKey.create.mock.calls[1];
    expect(cmhCall?.[0]?.privileges).toHaveLength(4);
  });

  it('supports template endpoint 404 by trying direct template create', async () => {
    const client = createClientMock({
      apiKeyTemplate: {
        listAPIKeysEligibility: vi.fn(async () => {
          throw new Error(
            'Platform API GET /rest/organizations/my-org/apikeytemplates/privileges/eligibility failed (404): {"errorCode":"INVALID_URI"}'
          );
        }),
      },
      organization: {
        listApiKeysPrivileges: vi.fn(async () => [
          {
            owner: 'CATALOG',
            targetDomain: 'CATALOG',
            level: 'VIEW',
          },
          {
            owner: 'MERCHANDISING_HUB',
            targetDomain: 'MERCHANDISING_HUB',
            level: 'VIEW_ALL',
          },
          {
            owner: 'COMMERCE',
            targetDomain: 'PRODUCT_LISTING',
            level: 'VIEW',
          },
          {
            owner: 'ORGANIZATION',
            targetDomain: 'ORGANIZATION',
            level: 'VIEW',
          },
        ]),
      },
    });

    const result = await resolveAccessTokens({
      organizationId: 'my-org',
      accessToken: 'platform-token',
      keyStrategy: {
        mode: 'managed',
      },
      clientFactory: vi.fn(() => client),
    });

    expect(result.engineAccessToken).toBe('ctc-engine-my-org-token');
    expect(result.cmhAccessToken).toBe('ctc-cmh-my-org-token');
    expect(client.apiKey.create).toHaveBeenCalledTimes(2);
  });

  it('accepts Merchandising Hub view-all encoded through targetId', async () => {
    const client = createClientMock({
      apiKeyTemplate: {
        listAPIKeysEligibility: vi.fn(async () => [{id: 'AnonymousSearch', canGenerate: true}]),
      },
      organization: {
        listApiKeysPrivileges: vi.fn(async () => [
          {
            owner: 'CATALOG',
            targetDomain: 'CATALOG',
            level: 'VIEW',
          },
          {
            owner: 'MERCHANDISING_HUB',
            targetDomain: 'MERCHANDISING_HUB',
            targetId: 'ALL',
            level: 'VIEW',
          },
          {
            owner: 'COMMERCE',
            targetDomain: 'PRODUCT_LISTING',
            level: 'VIEW',
          },
          {
            owner: 'ORGANIZATION',
            targetDomain: 'ORGANIZATION',
            level: 'VIEW',
          },
        ]),
      },
    });

    const result = await resolveAccessTokens({
      organizationId: 'my-org',
      accessToken: 'platform-token',
      keyStrategy: {
        mode: 'managed',
      },
      clientFactory: vi.fn(() => client),
    });

    expect(result.engineAccessToken).toBe('ctc-engine-my-org-token');
    expect(result.cmhAccessToken).toBe('ctc-cmh-my-org-token');
    expect(client.apiKey.create).toHaveBeenCalledTimes(2);
  });

  it('retries REST fallback in allowed region when organization is in EU', async () => {
    const now = Date.now();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () =>
          JSON.stringify({
            message:
              "Organization: 'my-org' does not accept requests in current region 'us-east-2'. Allowed region(s): '[eu-west-1]'.",
            errorCode: 'INVALID_REQUEST',
          }),
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => '[]',
        json: async () => [
          {
            id: 'engine-id',
            displayName: 'ctc-engine-my-org',
            value: 'engine-token',
            createdDate: now,
            enabled: true,
          },
          {
            id: 'cmh-id',
            displayName: 'ctc-cmh-my-org',
            value: 'cmh-token',
            createdDate: now,
            enabled: true,
          },
        ],
      });

    vi.stubGlobal('fetch', fetchMock);

    const failingClient = createClientMock({
      apiKey: {
        list: vi.fn(async () => {
          throw new Error('Failed to parse URL from /rest/organizations/my-org/apikeys');
        }),
        get: vi.fn(async (id: string) => ({id, value: ''})),
        create: vi.fn(async (model, options) => ({
          id: `${model.displayName}-id`,
          displayName: model.displayName,
          value: `${model.displayName}-token`,
          options,
        })),
      },
    });

    try {
      const result = await resolveAccessTokens({
        organizationId: 'my-org',
        accessToken: 'platform-token',
        keyStrategy: {
          mode: 'managed',
        },
        clientFactory: vi.fn(async () => failingClient),
      });

      expect(result.engineAccessToken).toBe('engine-token');
      expect(result.cmhAccessToken).toBe('cmh-token');
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(String(fetchMock.mock.calls[0]?.[0])).toContain('https://platform.cloud.coveo.com');
      expect(String(fetchMock.mock.calls[1]?.[0])).toContain('https://platform-eu.cloud.coveo.com');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('fails with actionable error when CMH privileges are unavailable', async () => {
    const client = createClientMock({
      apiKeyTemplate: {
        listAPIKeysEligibility: vi.fn(async () => [{id: 'AnonymousSearch', canGenerate: true}]),
      },
      organization: {
        listApiKeysPrivileges: vi.fn(async () => []),
      },
    });

    await expect(
      resolveAccessTokens({
        organizationId: 'my-org',
        accessToken: 'platform-token',
        keyStrategy: {
          mode: 'managed',
        },
        clientFactory: vi.fn(() => client),
      })
    ).rejects.toThrow('Catalog - View');
  });
});
