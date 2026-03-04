import {spawn} from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {
  getPortFromArgv,
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

async function prepareHostedLocal(argv) {
  ensureServiceBuild();

  const {resolveRuntimeConfigForRequest, serializeWindowRuntimeConfig} = await loadServiceModule();
  const request = resolveDeployRequestFromContext(argv, {
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
    `[hosted-local] Generated runtime config (source=${keyInfo.source}, created=${String(keyInfo.created)}).`
  );
}

async function main() {
  const argv = process.argv.slice(2);
  const port = getPortFromArgv(argv, 4173);

  await prepareHostedLocal(argv);

  const viteArgs = [
    'vite',
    '--config',
    'hosted-local/vite.hosted-local.config.ts',
    '--host',
    '127.0.0.1',
    '--port',
    String(port),
  ];

  const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const child = spawn(command, viteArgs, {
    cwd: projectRoot,
    stdio: 'inherit',
    env: process.env,
  });

  child.on('exit', (code) => {
    process.exit(code ?? 1);
  });
}

await main();
