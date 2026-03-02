import {spawn} from 'node:child_process';
import path from 'node:path';
import {
  getProfileFromArgv,
  getPortFromArgv,
  loadProfileEnv,
  mapProfileToRuntimeConfig,
  projectRoot,
  writeGeneratedRuntimeConfig,
} from './load-profile-env.mjs';
import fs from 'node:fs/promises';

async function prepareHostedLocal(profile) {
  const {env} = await loadProfileEnv(profile);
  const runtimeConfig = mapProfileToRuntimeConfig(env);
  await writeGeneratedRuntimeConfig(runtimeConfig);

  const outputPath = path.resolve(projectRoot, 'hosted-local', 'generated-config.js');
  await fs.writeFile(
    outputPath,
    `window.__APP_CONFIG = ${JSON.stringify(runtimeConfig, null, 2)};\n`,
    'utf8'
  );
}

async function main() {
  const profile = getProfileFromArgv();
  const port = getPortFromArgv(process.argv.slice(2), 4173);

  await prepareHostedLocal(profile);

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
