import {spawnSync} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import type {CoveoDeployConfig} from './deploy-config.js';
import {
  requestPlatformJson,
  resolvePlatformBaseUrl,
  resolveRegionRetryBaseUrl,
} from './platform-client.js';
import type {
  DeployExecutionOptions,
  DeployExecutor,
  DeployResult,
  HostedPageApiDeployExecutorOptions,
} from './types.js';

function resolveCommand() {
  return process.platform === 'win32' ? 'coveo.cmd' : 'coveo';
}

function extractHostedPageId(output: string): string | undefined {
  const match = output.match(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i);
  return match?.[0];
}

function toString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

type HostedPageJavaScriptResource = {
  isModule: boolean;
  inlineContent?: string;
  url?: string;
};

type HostedPageCssResource = {
  inlineContent?: string;
  url?: string;
};

type HostedPagePayload = {
  name: string;
  html: string;
  javascript?: HostedPageJavaScriptResource[];
  css?: HostedPageCssResource[];
};

type HostedPageResponse = {
  id?: string;
};

function getPlatformBaseUrl(region?: string, overrideBaseUrl?: string) {
  return resolvePlatformBaseUrl(
    region,
    overrideBaseUrl || process.env.APP_PLATFORM_BASE_URL || process.env.COVEO_PLATFORM_BASE_URL
  );
}

async function readDeployConfig(configPath: string): Promise<CoveoDeployConfig> {
  const raw = await fs.readFile(configPath, 'utf8');
  const parsed = JSON.parse(raw) as Partial<CoveoDeployConfig>;
  const name = toString(parsed.name);
  const dir = toString(parsed.dir);
  const htmlEntryPath = toString(parsed.htmlEntryFile?.path);

  if (!name) {
    throw new Error(`Deploy config missing required "name": ${configPath}`);
  }

  if (!dir) {
    throw new Error(`Deploy config missing required "dir": ${configPath}`);
  }

  if (!htmlEntryPath) {
    throw new Error(`Deploy config missing required "htmlEntryFile.path": ${configPath}`);
  }

  return parsed as CoveoDeployConfig;
}

async function readBundleFile(bundleDir: string, relativePath: string) {
  const normalizedPath = toString(relativePath);
  if (!normalizedPath) {
    throw new Error(`Deploy config references an empty bundle file path in ${bundleDir}`);
  }

  return fs.readFile(path.resolve(bundleDir, normalizedPath), 'utf8');
}

async function buildHostedPagePayload(
  configPath: string,
  cwd: string
): Promise<{config: CoveoDeployConfig; payload: HostedPagePayload}> {
  const config = await readDeployConfig(configPath);
  const bundleDir = path.resolve(cwd, config.dir);
  const html = await readBundleFile(bundleDir, config.htmlEntryFile.path);

  const javascriptEntryFiles = await Promise.all(
    config.javascriptEntryFiles.map(async (entry) => ({
      isModule: Boolean(entry.isModule),
      inlineContent: await readBundleFile(bundleDir, entry.path),
    }))
  );
  const javascriptUrls = config.javascriptUrls.map((entry) => ({
    isModule: Boolean(entry.isModule),
    url: entry.path,
  }));
  const cssEntryFiles = await Promise.all(
    config.cssEntryFiles.map(async (entry) => ({
      inlineContent: await readBundleFile(bundleDir, entry.path),
    }))
  );
  const cssUrls = config.cssUrls.map((entry) => ({
    url: entry.path,
  }));

  const javascript = [...javascriptEntryFiles, ...javascriptUrls];
  const css = [...cssEntryFiles, ...cssUrls];

  return {
    config,
    payload: {
      name: config.name,
      html,
      ...(javascript.length > 0 ? {javascript} : {}),
      ...(css.length > 0 ? {css} : {}),
    },
  };
}

export class HostedPageApiDeployExecutor implements DeployExecutor {
  public constructor(private readonly options: HostedPageApiDeployExecutorOptions) {}

  public async deploy(
    configPath: string,
    cwd = process.cwd(),
    options: DeployExecutionOptions = {}
  ): Promise<DeployResult> {
    const organizationId = toString(this.options.organizationId);
    const accessToken = toString(this.options.accessToken);

    if (!organizationId) {
      throw new Error('Hosted deploy missing required organizationId.');
    }

    if (!accessToken) {
      throw new Error('Hosted deploy missing required accessToken.');
    }

    const {config, payload} = await buildHostedPagePayload(configPath, cwd);
    const pageId = toString(options.pageId);
    const method = pageId ? 'PUT' : 'POST';
    const endpoint = pageId
      ? `/rest/organizations/${organizationId}/hostedpages/${pageId}`
      : `/rest/organizations/${organizationId}/hostedpages`;
    let activeBaseUrl = getPlatformBaseUrl(this.options.region, this.options.baseUrl);

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const response = await requestPlatformJson<HostedPageResponse>({
        baseUrl: activeBaseUrl,
        method,
        endpoint,
        accessToken,
        body: payload,
      });

      if (response.ok) {
        const hostedPageId = toString(response.body?.id);
        const action = pageId ? 'updated' : 'created';

        return {
          stdout: [
            `[api] ${action} hosted page "${config.name}" via ${method} ${endpoint}.`,
            hostedPageId ? `[api] hostedPageId=${hostedPageId}` : '',
          ]
            .filter(Boolean)
            .join('\n'),
          stderr: '',
          ...(hostedPageId ? {hostedPageId} : {}),
        };
      }

      const retryBaseUrl = resolveRegionRetryBaseUrl({
        status: response.status,
        errorBody: response.bodyText,
        currentBaseUrl: activeBaseUrl,
      });
      if (retryBaseUrl) {
        this.options.logger?.(
          `[service] Hosted deploy reported region mismatch; retrying ${method} ${endpoint} against ${retryBaseUrl}.`
        );
        activeBaseUrl = retryBaseUrl;
        continue;
      }

      throw new Error(`Hosted deploy failed (${response.status}) for ${endpoint}: ${response.bodyText}`);
    }

    throw new Error(`Hosted deploy failed after retry attempts for ${endpoint}.`);
  }
}

export class CoveoCliDeployExecutor implements DeployExecutor {
  public async deploy(
    configPath: string,
    cwd = process.cwd(),
    options: DeployExecutionOptions = {}
  ): Promise<DeployResult> {
    const command = resolveCommand();
    const args = ['ui:deploy', '--config', configPath];
    if (options.pageId?.trim()) {
      args.push('--pageId', options.pageId.trim());
    }

    const result = spawnSync(command, args, {
      cwd,
      encoding: 'utf8',
    });

    const stdout = result.stdout ?? '';
    const stderr = result.stderr ?? '';

    if (result.status !== 0) {
      throw new Error(
        [`Hosted deploy failed (exit ${result.status ?? 'unknown'}).`, stdout.trim(), stderr.trim()]
          .filter(Boolean)
          .join('\n')
      );
    }

    const hostedPageId = extractHostedPageId(stdout);

    return {
      stdout,
      stderr,
      ...(hostedPageId ? {hostedPageId} : {}),
    };
  }
}
