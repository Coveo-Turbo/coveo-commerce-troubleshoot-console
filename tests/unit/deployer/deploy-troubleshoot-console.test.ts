import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {describe, expect, it, vi} from 'vitest';
import {
  deployTroubleshootConsole,
  resolveRuntimeConfigForRequest,
} from '../../../packages/commerce-troubleshoot-deployer/src/deploy-troubleshoot-console';

async function createTemplateDir() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'ctc-template-'));
  await fs.mkdir(path.join(dir, 'js'), {recursive: true});
  await fs.mkdir(path.join(dir, 'styles'), {recursive: true});
  await fs.writeFile(path.join(dir, 'troubleshoot.html'), '<div data-template="troubleshoot"></div>\n', 'utf8');
  await fs.writeFile(path.join(dir, 'js', 'app.js'), 'console.log("app");\n', 'utf8');
  await fs.writeFile(path.join(dir, 'styles', 'main.css'), '.root{}\n', 'utf8');
  return dir;
}

describe('deploy-troubleshoot-console', () => {
  it('fails fast when required request fields are missing', async () => {
    await expect(
      resolveRuntimeConfigForRequest({
        target: {
          organizationId: '',
          hostedPageName: 'my-page',
        },
        auth: {
          accessToken: 'platform-token',
        },
        keyStrategy: {
          mode: 'provided',
          engineAccessToken: 'engine-token',
        },
      })
    ).rejects.toThrow('target.organizationId');
  });

  it('builds bundle and deploy config in dry-run mode', async () => {
    const templateDir = await createTemplateDir();
    const outputRootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ctc-output-'));

    const result = await deployTroubleshootConsole({
      target: {
        organizationId: 'my-org',
        hostedPageName: 'my-page',
      },
      auth: {
        accessToken: 'platform-token',
      },
      keyStrategy: {
        mode: 'provided',
        engineAccessToken: 'engine-token',
        cmhAccessToken: 'cmh-token',
      },
      artifact: {
        templateDir,
      },
      deploy: {
        dryRun: true,
        outputRootDir,
      },
    });

    const runtimeConfig = await fs.readFile(path.join(result.bundleDir, 'js', 'runtime-config.js'), 'utf8');
    const deployConfig = JSON.parse(await fs.readFile(result.deployConfigPath, 'utf8'));

    expect(result.deployed).toBe(false);
    expect(runtimeConfig).toContain('"engineAccessToken": "engine-token"');
    expect(deployConfig.javascriptEntryFiles[0].path).toBe('js/runtime-config.js');
    expect(deployConfig.javascriptEntryFiles[1].path).toBe('js/app.js');
  });

  it('calls deploy executor for non dry-run deployments', async () => {
    const templateDir = await createTemplateDir();
    const outputRootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ctc-output-'));
    const deploy = vi.fn(async () => ({
      stdout: 'deployed',
      stderr: '',
      hostedPageId: '123e4567-e89b-12d3-a456-426614174000',
    }));
    const hostedPageIdResolver = vi.fn(async () => undefined);

    const result = await deployTroubleshootConsole(
      {
        target: {
          organizationId: 'my-org',
          hostedPageName: 'my-page',
        },
        auth: {
          accessToken: 'platform-token',
        },
        keyStrategy: {
          mode: 'provided',
          engineAccessToken: 'engine-token',
          cmhAccessToken: 'cmh-token',
        },
        artifact: {
          templateDir,
        },
        deploy: {
          dryRun: false,
          outputRootDir,
        },
      },
      {
        deployExecutor: {
          deploy,
        },
        hostedPageIdResolver,
      }
    );

    expect(result.deployed).toBe(true);
    expect(result.hostedPageId).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(deploy).toHaveBeenCalledWith(result.deployConfigPath, outputRootDir, {});
    expect(hostedPageIdResolver).toHaveBeenCalledTimes(1);
  });

  it('forwards hostedPageId to deploy executor when provided', async () => {
    const templateDir = await createTemplateDir();
    const outputRootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ctc-output-'));
    const deploy = vi.fn(async () => ({
      stdout: 'deployed',
      stderr: '',
      hostedPageId: '123e4567-e89b-12d3-a456-426614174001',
    }));
    const hostedPageIdResolver = vi.fn(async () => undefined);

    const result = await deployTroubleshootConsole(
      {
        target: {
          organizationId: 'my-org',
          hostedPageName: 'my-page',
          hostedPageId: '7944ff4a-9943-4999-a3f6-3e81a7f6fb0a',
        },
        auth: {
          accessToken: 'platform-token',
        },
        keyStrategy: {
          mode: 'provided',
          engineAccessToken: 'engine-token',
          cmhAccessToken: 'cmh-token',
        },
        artifact: {
          templateDir,
        },
        deploy: {
          dryRun: false,
          outputRootDir,
        },
      },
      {
        deployExecutor: {
          deploy,
        },
        hostedPageIdResolver,
      }
    );

    expect(result.deployed).toBe(true);
    expect(deploy).toHaveBeenCalledWith(result.deployConfigPath, outputRootDir, {
      pageId: '7944ff4a-9943-4999-a3f6-3e81a7f6fb0a',
    });
    expect(hostedPageIdResolver).not.toHaveBeenCalled();
  });

  it('resolves hostedPageId by name and forwards it to deploy executor', async () => {
    const templateDir = await createTemplateDir();
    const outputRootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ctc-output-'));
    const deploy = vi.fn(async () => ({
      stdout: 'deployed',
      stderr: '',
      hostedPageId: '123e4567-e89b-12d3-a456-426614174001',
    }));
    const hostedPageIdResolver = vi.fn(async () => '7944ff4a-9943-4999-a3f6-3e81a7f6fb0a');

    const result = await deployTroubleshootConsole(
      {
        target: {
          organizationId: 'my-org',
          hostedPageName: 'my-page',
        },
        auth: {
          accessToken: 'platform-token',
        },
        keyStrategy: {
          mode: 'provided',
          engineAccessToken: 'engine-token',
          cmhAccessToken: 'cmh-token',
        },
        artifact: {
          templateDir,
        },
        deploy: {
          dryRun: false,
          outputRootDir,
        },
      },
      {
        deployExecutor: {
          deploy,
        },
        hostedPageIdResolver,
      }
    );

    expect(result.deployed).toBe(true);
    expect(hostedPageIdResolver).toHaveBeenCalledWith({
      organizationId: 'my-org',
      accessToken: 'platform-token',
      hostedPageName: 'my-page',
    });
    expect(deploy).toHaveBeenCalledWith(result.deployConfigPath, outputRootDir, {
      pageId: '7944ff4a-9943-4999-a3f6-3e81a7f6fb0a',
    });
  });

  it('resolves runtime config payload and honors provided CMH fallback', async () => {
    const resolved = await resolveRuntimeConfigForRequest({
      target: {
        organizationId: 'my-org',
        hostedPageName: 'my-page',
      },
      auth: {
        accessToken: 'platform-token',
      },
      keyStrategy: {
        mode: 'provided',
        engineAccessToken: 'engine-token',
      },
    });

    expect(resolved.payload.engineAccessToken).toBe('engine-token');
    expect(resolved.payload.cmhAccessToken).toBe('engine-token');
    expect(resolved.keyInfo.source).toBe('provided');
  });
});
