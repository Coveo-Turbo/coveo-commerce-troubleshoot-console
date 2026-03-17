import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createDeployConfig, writeDeployConfig} from './deploy-config.js';
import {HostedPageApiDeployExecutor} from './deploy-executor.js';
import {resolveHostedPageIdByName} from './hosted-page-resolver.js';
import {resolveAccessTokens} from './key-manager.js';
import {buildRuntimeConfigPayload, serializeWindowRuntimeConfig} from './runtime-config.js';
import {materializeBundle} from './temp-bundle.js';
import type {
  DeployServiceOptions,
  DeployTroubleshootRequest,
  DeployTroubleshootResult,
  RuntimeConfigPayload,
} from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultTemplateDir = path.resolve(__dirname, '../assets/template');

function toString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function assertRequired(value: string, name: string) {
  if (!value) {
    throw new Error(`Missing required value: ${name}.`);
  }
}

function normalizeRequest(request: DeployTroubleshootRequest): DeployTroubleshootRequest {
  const hostedPageId = toString(request.target.hostedPageId);
  const region = toString(request.target.region);
  const environment = toString(request.target.environment);
  const defaultProductTemplatePresetId = toString(request.target.defaultProductTemplatePresetId);
  const templateDir = toString(request.artifact?.templateDir);
  const version = toString(request.artifact?.version);
  const outputRootDir = toString(request.deploy?.outputRootDir);
  const bundleRelativeDir = toString(request.deploy?.bundleRelativeDir);
  const deployConfigRelativePath = toString(request.deploy?.deployConfigRelativePath);

  const normalized: DeployTroubleshootRequest = {
    target: {
      organizationId: toString(request.target.organizationId),
      hostedPageName: toString(request.target.hostedPageName),
      ...(hostedPageId ? {hostedPageId} : {}),
      ...(region ? {region} : {}),
      ...(environment ? {environment} : {}),
      ...(defaultProductTemplatePresetId ? {defaultProductTemplatePresetId} : {}),
    },
    auth: {
      accessToken: toString(request.auth.accessToken),
    },
    keyStrategy: request.keyStrategy ?? {mode: 'managed'},
    ...(request.runtimeDefaults ? {runtimeDefaults: request.runtimeDefaults} : {}),
    ...(request.artifact
      ? {
          artifact: {
            ...request.artifact,
            ...(templateDir ? {templateDir} : {}),
            ...(version ? {version} : {}),
          },
        }
      : {}),
    deploy: {
      dryRun: Boolean(request.deploy?.dryRun),
      ...(outputRootDir ? {outputRootDir} : {}),
      ...(bundleRelativeDir ? {bundleRelativeDir} : {}),
      ...(deployConfigRelativePath ? {deployConfigRelativePath} : {}),
    },
  };

  assertRequired(normalized.target.organizationId, 'target.organizationId');
  assertRequired(normalized.target.hostedPageName, 'target.hostedPageName');
  assertRequired(normalized.auth.accessToken, 'auth.accessToken');

  return normalized;
}

export async function resolveRuntimeConfigForRequest(
  request: DeployTroubleshootRequest,
  options: Pick<DeployServiceOptions, 'logger' | 'managedKeyCachePath'> = {}
): Promise<{payload: RuntimeConfigPayload; keyInfo: DeployTroubleshootResult['keyInfo']}> {
  const normalized = normalizeRequest(request);

  const resolvedTokens = await resolveAccessTokens({
    organizationId: normalized.target.organizationId,
    accessToken: normalized.auth.accessToken,
    ...(normalized.target.region ? {region: normalized.target.region} : {}),
    ...(normalized.target.environment ? {environment: normalized.target.environment} : {}),
    ...(options.managedKeyCachePath ? {cacheFilePath: options.managedKeyCachePath} : {}),
    ...(normalized.keyStrategy ? {keyStrategy: normalized.keyStrategy} : {}),
    ...(options.logger ? {logger: options.logger} : {}),
  });

  const payload = buildRuntimeConfigPayload({
    organizationId: normalized.target.organizationId,
    ...(normalized.target.region ? {region: normalized.target.region} : {}),
    hostedPageName: normalized.target.hostedPageName,
    ...(normalized.target.hostedPageId ? {hostedPageId: normalized.target.hostedPageId} : {}),
    ...(normalized.target.defaultProductTemplatePresetId
      ? {defaultProductTemplatePresetId: normalized.target.defaultProductTemplatePresetId}
      : {}),
    engineAccessToken: resolvedTokens.engineAccessToken,
    cmhAccessToken: resolvedTokens.cmhAccessToken,
    ...(normalized.runtimeDefaults ? {defaults: normalized.runtimeDefaults} : {}),
  });

  return {
    payload,
    keyInfo: resolvedTokens.keyInfo,
  };
}

export async function deployTroubleshootConsole(
  request: DeployTroubleshootRequest,
  options: DeployServiceOptions = {}
): Promise<DeployTroubleshootResult> {
  const normalized = normalizeRequest(request);
  const logger = options.logger;
  const diagnostics: string[] = [];

  const {payload, keyInfo} = await resolveRuntimeConfigForRequest(normalized, {
    ...(logger ? {logger} : {}),
    ...(options.managedKeyCachePath ? {managedKeyCachePath: options.managedKeyCachePath} : {}),
  });

  const templateDir = normalized.artifact?.templateDir ?? defaultTemplateDir;
  const deployLayout = await materializeBundle({
    templateDir,
    runtimeConfigContent: serializeWindowRuntimeConfig(payload),
    ...(normalized.deploy?.outputRootDir ? {outputRootDir: normalized.deploy.outputRootDir} : {}),
    ...(normalized.deploy?.bundleRelativeDir
      ? {bundleRelativeDir: normalized.deploy.bundleRelativeDir}
      : {}),
    ...(normalized.deploy?.deployConfigRelativePath
      ? {deployConfigRelativePath: normalized.deploy.deployConfigRelativePath}
      : {}),
  });

  const deployConfig = createDeployConfig({
    hostedPageName: normalized.target.hostedPageName,
    bundleRelativeDir: deployLayout.bundleRelativeDir,
  });

  await writeDeployConfig(deployLayout.deployConfigPath, deployConfig);

  diagnostics.push(`[service] template=${templateDir}`);
  diagnostics.push(`[service] bundle=${deployLayout.bundleDir}`);
  diagnostics.push(`[service] deployConfig=${deployLayout.deployConfigPath}`);

  let deployed = false;
  let hostedPageId = normalized.target.hostedPageId;

  if (!normalized.deploy?.dryRun) {
    if (!hostedPageId) {
      const lookup = options.hostedPageIdResolver ?? resolveHostedPageIdByName;
      hostedPageId = await lookup({
        organizationId: normalized.target.organizationId,
        accessToken: normalized.auth.accessToken,
        hostedPageName: normalized.target.hostedPageName,
        ...(normalized.target.region ? {region: normalized.target.region} : {}),
        ...(normalized.target.environment ? {environment: normalized.target.environment} : {}),
        ...(logger ? {logger} : {}),
      });

      if (hostedPageId) {
        diagnostics.push(
          `[service] resolved existing hosted page id "${hostedPageId}" from name "${normalized.target.hostedPageName}".`
        );
      } else {
        diagnostics.push(
          `[service] no hosted page id resolved from name "${normalized.target.hostedPageName}"; deploy will rely on page name and may create a new hosted page.`
        );
      }
    }

    const executor =
      options.deployExecutor ??
      new HostedPageApiDeployExecutor({
        organizationId: normalized.target.organizationId,
        accessToken: normalized.auth.accessToken,
        ...(normalized.target.region ? {region: normalized.target.region} : {}),
        ...(logger ? {logger} : {}),
      });
    const execution = await executor.deploy(deployLayout.deployConfigPath, deployLayout.workspaceRoot, {
      ...(hostedPageId ? {pageId: hostedPageId} : {}),
    });
    deployed = true;

    if (execution.hostedPageId) {
      hostedPageId = execution.hostedPageId;
    }

    if (execution.stdout.trim()) {
      diagnostics.push(execution.stdout.trim());
    }
    if (execution.stderr.trim()) {
      diagnostics.push(execution.stderr.trim());
    }
  }

  logger?.(`[service] completed deploy workflow; deployed=${String(deployed)}.`);

  return {
    organizationId: normalized.target.organizationId,
    hostedPageName: normalized.target.hostedPageName,
    ...(hostedPageId ? {hostedPageId} : {}),
    deployed,
    bundleDir: deployLayout.bundleDir,
    deployConfigPath: deployLayout.deployConfigPath,
    runtimeConfigPath: deployLayout.runtimeConfigPath,
    keyInfo,
    diagnostics,
  };
}
