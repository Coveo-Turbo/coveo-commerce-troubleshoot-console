import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {
  projectRoot,
  resolveDeployRequestFromContext,
  writeGeneratedRuntimeConfig,
} from './load-profile-env.mjs';

function ensureServiceBuild() {
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(command, ['run', 'build:service'], {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

async function loadServiceModule() {
  return import(path.resolve(projectRoot, 'packages', 'commerce-troubleshoot-deployer', 'dist', 'index.js'));
}

async function main() {
  ensureServiceBuild();

  const {resolveRuntimeConfigForRequest, serializeWindowRuntimeConfig} = await loadServiceModule();
  const request = resolveDeployRequestFromContext(process.argv.slice(2), {
    dryRun: true,
  });

  const {payload, keyInfo} = await resolveRuntimeConfigForRequest(request, {
    logger: (message) => console.log(message),
    managedKeyCachePath: path.resolve(projectRoot, '.cache', 'managed-keys.json'),
  });

  await writeGeneratedRuntimeConfig(payload);

  const outputPath = path.resolve(projectRoot, 'hosted-local', 'generated-config.js');
  await fs.writeFile(outputPath, serializeWindowRuntimeConfig(payload), 'utf8');

  console.log(
    `[hosted-local] Prepared runtime config at ${outputPath} (source=${keyInfo.source}, created=${String(
      keyInfo.created
    )}).`
  );
}

await main();
