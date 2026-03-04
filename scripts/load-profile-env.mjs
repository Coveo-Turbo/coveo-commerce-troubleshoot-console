import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

dotenv.config({path: path.resolve(projectRoot, '.env')});

function readArg(argv, name) {
  const index = argv.findIndex((value) => value === `--${name}`);
  if (index === -1) {
    return '';
  }

  return argv[index + 1] ?? '';
}

function hasFlag(argv, name) {
  return argv.includes(`--${name}`);
}

export function getPortFromArgv(argv = process.argv.slice(2), fallback = 4173) {
  const value = readArg(argv, 'port');
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function readCliConfigValue(key) {
  const command = process.platform === 'win32' ? 'coveo.cmd' : 'coveo';
  const result = spawnSync(command, ['config:get', key], {
    cwd: projectRoot,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    return '';
  }

  const raw = result.stdout.trim();
  if (!raw) {
    return '';
  }

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'string') {
      return parsed.trim();
    }

    if (parsed && typeof parsed === 'object') {
      if (typeof parsed[key] === 'string') {
        return parsed[key].trim();
      }

      const values = Object.values(parsed).filter((value) => typeof value === 'string');
      if (values.length === 1) {
        return values[0].trim();
      }
    }
  } catch {
    // Fall through to raw output handling.
  }

  return raw;
}

function readFromArgOrEnv(argv, argName, envName) {
  return readArg(argv, argName) || process.env[envName] || '';
}

function readRuntimeDefaults(argv) {
  return {
    trackingId: readFromArgOrEnv(argv, 'tracking-id', 'APP_DEFAULT_TRACKING_ID') || undefined,
    language: readFromArgOrEnv(argv, 'language', 'APP_DEFAULT_LANGUAGE') || 'en',
    country: readFromArgOrEnv(argv, 'country', 'APP_DEFAULT_COUNTRY') || 'US',
    currency: readFromArgOrEnv(argv, 'currency', 'APP_DEFAULT_CURRENCY') || 'USD',
    viewUrl: readFromArgOrEnv(argv, 'view-url', 'APP_DEFAULT_VIEW_URL') || 'https://www.example.com/',
  };
}

function readKeyStrategy(argv) {
  const engineAccessToken =
    readFromArgOrEnv(argv, 'engine-token', 'APP_ENGINE_ACCESS_TOKEN') ||
    readFromArgOrEnv(argv, 'engine-access-token', 'APP_ENGINE_ACCESS_TOKEN');

  const cmhAccessToken =
    readFromArgOrEnv(argv, 'cmh-token', 'APP_CMH_ACCESS_TOKEN') ||
    readFromArgOrEnv(argv, 'cmh-access-token', 'APP_CMH_ACCESS_TOKEN');

  if (engineAccessToken.trim()) {
    return {
      mode: 'provided',
      engineAccessToken,
      ...(cmhAccessToken.trim() ? {cmhAccessToken} : {}),
    };
  }

  return {
    mode: 'managed',
    rotate: hasFlag(argv, 'rotate'),
  };
}

export function resolveDeployRequestFromContext(
  argv = process.argv.slice(2),
  options = {
    dryRun: false,
    outputRootDir: undefined,
    bundleRelativeDir: undefined,
    deployConfigRelativePath: undefined,
  }
) {
  const organizationId =
    readFromArgOrEnv(argv, 'organization', 'APP_ORGANIZATION_ID') ||
    readFromArgOrEnv(argv, 'org', 'APP_ORGANIZATION_ID') ||
    readCliConfigValue('organization');

  const accessToken =
    readFromArgOrEnv(argv, 'access-token', 'APP_PLATFORM_ACCESS_TOKEN') ||
    readFromArgOrEnv(argv, 'access-token', 'APP_ACCESS_TOKEN') ||
    readCliConfigValue('accessToken');

  const resolvedPageName = readFromArgOrEnv(argv, 'page-name', 'APP_HOSTED_PAGE_NAME');
  if (!resolvedPageName) {
    console.warn(
      'No hosted page name provided. Defaulting to "commerce-troubleshoot-console-demo". ' +
        'Set --page-name or APP_HOSTED_PAGE_NAME to target a specific page.'
    );
  }

  const hostedPageName = resolvedPageName || 'commerce-troubleshoot-console-demo';

  const region = readFromArgOrEnv(argv, 'region', 'APP_REGION') || readCliConfigValue('region');
  const environment =
    readFromArgOrEnv(argv, 'environment', 'APP_ENVIRONMENT') || readCliConfigValue('environment');
  const hostedPageId = readFromArgOrEnv(argv, 'page-id', 'APP_HOSTED_PAGE_ID') || undefined;
  const defaultProductTemplatePresetId =
    readFromArgOrEnv(argv, 'default-product-template-preset-id', 'APP_DEFAULT_PRODUCT_TEMPLATE_PRESET_ID') ||
    undefined;

  if (!organizationId.trim()) {
    throw new Error('Missing organization ID. Set APP_ORGANIZATION_ID or run coveo auth:login.');
  }

  if (!accessToken.trim()) {
    throw new Error(
      'Missing Coveo access token. Set APP_PLATFORM_ACCESS_TOKEN or APP_ACCESS_TOKEN, or run coveo auth:login.'
    );
  }

  return {
    target: {
      organizationId,
      hostedPageName,
      ...(hostedPageId ? {hostedPageId} : {}),
      ...(region ? {region} : {}),
      ...(environment ? {environment} : {}),
      ...(defaultProductTemplatePresetId ? {defaultProductTemplatePresetId} : {}),
    },
    auth: {
      accessToken,
    },
    runtimeDefaults: readRuntimeDefaults(argv),
    keyStrategy: readKeyStrategy(argv),
    deploy: {
      dryRun: Boolean(options.dryRun),
      ...(options.outputRootDir ? {outputRootDir: options.outputRootDir} : {}),
      ...(options.bundleRelativeDir ? {bundleRelativeDir: options.bundleRelativeDir} : {}),
      ...(options.deployConfigRelativePath
        ? {deployConfigRelativePath: options.deployConfigRelativePath}
        : {}),
    },
  };
}

export async function writeGeneratedRuntimeConfig(runtimeConfig) {
  const outputPath = path.resolve(projectRoot, 'src', 'app', 'runtime-config.generated.ts');
  const content = `import type {AppRuntimeConfig} from '../types/app-config';\n\nconst generatedConfig: Partial<AppRuntimeConfig> = ${JSON.stringify(
    runtimeConfig,
    null,
    2
  )};\n\nexport default generatedConfig;\n`;

  await fs.writeFile(outputPath, content, 'utf8');
  return outputPath;
}

export {projectRoot};
