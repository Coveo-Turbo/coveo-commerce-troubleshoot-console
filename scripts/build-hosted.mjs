import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {projectRoot, resolveDeployRequestFromContext} from './load-profile-env.mjs';

function ensureServiceReady() {
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(command, ['run', 'build:service:prepare'], {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

async function loadServiceModule() {
  return import(pathToFileURL(path.resolve(projectRoot, 'packages', 'commerce-troubleshoot-deployer', 'dist', 'index.js')).href);
}

async function main() {
  ensureServiceReady();

  const {deployTroubleshootConsole} = await loadServiceModule();
  const request = resolveDeployRequestFromContext(process.argv.slice(2), {
    dryRun: true,
    outputRootDir: projectRoot,
    bundleRelativeDir: 'dist/bundle',
    deployConfigRelativePath: 'coveo.deploy.json',
  });

  const result = await deployTroubleshootConsole(request, {
    logger: (message) => console.log(message),
    managedKeyCachePath: path.resolve(projectRoot, '.cache', 'managed-keys.json'),
  });

  console.log(`[hosted] Bundle directory: ${result.bundleDir}`);
  console.log(`[hosted] Deploy config: ${result.deployConfigPath}`);
}

await main();
