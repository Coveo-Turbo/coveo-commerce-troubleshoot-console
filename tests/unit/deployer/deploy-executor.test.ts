import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {describe, expect, it, vi} from 'vitest';
import {createDeployConfig, writeDeployConfig} from '../../../packages/commerce-troubleshoot-deployer/src/deploy-config';
import {HostedPageApiDeployExecutor} from '../../../packages/commerce-troubleshoot-deployer/src/deploy-executor';

function createJsonResponse(status: number, payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  });
}

async function createWorkspace() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'ctc-executor-'));
  const bundleDir = path.join(root, 'bundle');

  await fs.mkdir(path.join(bundleDir, 'js'), {recursive: true});
  await fs.mkdir(path.join(bundleDir, 'styles'), {recursive: true});
  await fs.writeFile(path.join(bundleDir, 'troubleshoot.html'), '<div data-template="troubleshoot"></div>\n', 'utf8');
  await fs.writeFile(path.join(bundleDir, 'js', 'runtime-config.js'), 'window.__APP_CONFIG = {};\n', 'utf8');
  await fs.writeFile(path.join(bundleDir, 'js', 'app.js'), 'console.log("app");\n', 'utf8');
  await fs.writeFile(path.join(bundleDir, 'styles', 'main.css'), '.root { color: red; }\n', 'utf8');

  const configPath = path.join(root, 'coveo.deploy.json');
  await writeDeployConfig(
    configPath,
    createDeployConfig({
      hostedPageName: 'my-page',
      bundleRelativeDir: 'bundle',
    })
  );

  return {
    root,
    configPath,
  };
}

describe('deploy-executor', () => {
  it('creates a hosted page directly through the hosted page API', async () => {
    const workspace = await createWorkspace();
    const fetchMock = vi.fn(async () =>
      createJsonResponse(200, {
        id: '123e4567-e89b-12d3-a456-426614174010',
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    try {
      const executor = new HostedPageApiDeployExecutor({
        organizationId: 'my-org',
        accessToken: 'platform-token',
      });

      const result = await executor.deploy(workspace.configPath, workspace.root);

      expect(result.hostedPageId).toBe('123e4567-e89b-12d3-a456-426614174010');
      expect(result.stdout).toContain('created hosted page "my-page"');

      const [url, request] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toBe('https://platform.cloud.coveo.com/rest/organizations/my-org/hostedpages');
      expect(request.method).toBe('POST');

      const payload = JSON.parse(String(request.body));
      expect(payload).toMatchObject({
        name: 'my-page',
        html: '<div data-template="troubleshoot"></div>\n',
      });
      expect(payload.javascript).toEqual([
        {
          isModule: true,
          inlineContent: 'window.__APP_CONFIG = {};\n',
        },
        {
          isModule: true,
          inlineContent: 'console.log("app");\n',
        },
        {
          isModule: true,
          url: 'https://static.cloud.coveo.com/atomic/v3/atomic.esm.js',
        },
      ]);
      expect(payload.css).toEqual([
        {
          inlineContent: '.root { color: red; }\n',
        },
        {
          url: 'https://static.cloud.coveo.com/atomic/v3/themes/coveo.css',
        },
        {
          url: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap',
        },
      ]);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('updates a hosted page directly through the hosted page API and retries in the allowed region', async () => {
    const workspace = await createWorkspace();
    const logger = vi.fn();
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
          id: '123e4567-e89b-12d3-a456-426614174011',
        })
      );
    vi.stubGlobal('fetch', fetchMock);

    try {
      const executor = new HostedPageApiDeployExecutor({
        organizationId: 'my-org',
        accessToken: 'platform-token',
        logger,
      });

      const result = await executor.deploy(workspace.configPath, workspace.root, {
        pageId: '7944ff4a-9943-4999-a3f6-3e81a7f6fb0a',
      });

      expect(result.hostedPageId).toBe('123e4567-e89b-12d3-a456-426614174011');
      expect(result.stdout).toContain('updated hosted page "my-page"');

      const calls = fetchMock.mock.calls as Array<[string, RequestInit]>;
      expect(calls[0]?.[0]).toBe(
        'https://platform.cloud.coveo.com/rest/organizations/my-org/hostedpages/7944ff4a-9943-4999-a3f6-3e81a7f6fb0a'
      );
      expect(calls[1]?.[0]).toBe(
        'https://platform-eu.cloud.coveo.com/rest/organizations/my-org/hostedpages/7944ff4a-9943-4999-a3f6-3e81a7f6fb0a'
      );
      expect(calls[1]?.[1].method).toBe('PUT');
      expect(logger).toHaveBeenCalledWith(
        expect.stringContaining('retrying PUT /rest/organizations/my-org/hostedpages/7944ff4a-9943-4999-a3f6-3e81a7f6fb0a against https://platform-eu.cloud.coveo.com')
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
