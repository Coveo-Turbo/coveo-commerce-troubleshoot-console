import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import dotenv from 'dotenv';

const REQUIRED_KEYS = [
  'APP_ORGANIZATION_ID',
  'APP_ENGINE_ACCESS_TOKEN',
  'APP_CMH_ACCESS_TOKEN',
  'APP_HOSTED_PAGE_NAME',
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function readArg(argv, name) {
  const index = argv.findIndex((value) => value === `--${name}`);
  if (index === -1) {
    return '';
  }

  return argv[index + 1] ?? '';
}

export function getProfileFromArgv(argv = process.argv.slice(2)) {
  return readArg(argv, 'profile') || '';
}

export function getPortFromArgv(argv = process.argv.slice(2), fallback = 4173) {
  const value = readArg(argv, 'port');
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getProfilePath(profile) {
  return path.resolve(projectRoot, 'profiles', `${profile}.env`);
}

function assertRequiredKeys(env) {
  const missing = REQUIRED_KEYS.filter((key) => !env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(`Profile is missing required keys: ${missing.join(', ')}`);
  }
}

export function mapProfileToRuntimeConfig(env) {
  return {
    organizationId: env.APP_ORGANIZATION_ID,
    engineAccessToken: env.APP_ENGINE_ACCESS_TOKEN,
    cmhAccessToken: env.APP_CMH_ACCESS_TOKEN,
    hostedPageName: env.APP_HOSTED_PAGE_NAME,
    hostedPageId: env.APP_HOSTED_PAGE_ID || undefined,
    defaults: {
      trackingId: env.APP_DEFAULT_TRACKING_ID || undefined,
      language: env.APP_DEFAULT_LANGUAGE || 'en',
      country: env.APP_DEFAULT_COUNTRY || 'US',
      currency: env.APP_DEFAULT_CURRENCY || 'USD',
      viewUrl: env.APP_DEFAULT_VIEW_URL || 'https://www.example.com/',
    },
  };
}

export async function loadProfileEnv(profile) {
  if (!profile) {
    throw new Error('Missing profile. Usage: --profile <name>');
  }

  const profilePath = getProfilePath(profile);
  const file = await fs.readFile(profilePath, 'utf8');
  const parsed = dotenv.parse(file);

  assertRequiredKeys(parsed);

  return {
    profile,
    profilePath,
    env: parsed,
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

if (import.meta.url === `file://${process.argv[1]}`) {
  const profile = getProfileFromArgv();
  const {env, profilePath} = await loadProfileEnv(profile);
  const runtimeConfig = mapProfileToRuntimeConfig(env);
  const output = await writeGeneratedRuntimeConfig(runtimeConfig);

  console.log(`[profile] Loaded ${profile} from ${profilePath}`);
  console.log(`[profile] Wrote runtime config: ${output}`);
}
