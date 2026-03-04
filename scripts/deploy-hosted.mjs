import {spawnSync} from 'node:child_process';
import path from 'node:path';
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
  return import(path.resolve(projectRoot, 'packages', 'commerce-troubleshoot-deployer', 'dist', 'index.js'));
}

async function main() {
  ensureServiceReady();

  const {deployTroubleshootConsole} = await loadServiceModule();
  const request = resolveDeployRequestFromContext(process.argv.slice(2), {
    dryRun: false,
    outputRootDir: projectRoot,
    bundleRelativeDir: 'dist/bundle',
    deployConfigRelativePath: 'coveo.deploy.json',
  });

  const result = await deployTroubleshootConsole(request, {
    logger: (message) => console.log(message),
    managedKeyCachePath: path.resolve(projectRoot, '.cache', 'managed-keys.json'),
  });

  console.log(`[deploy] Hosted page name: ${result.hostedPageName}`);
  if (result.hostedPageId) {
    console.log(`[deploy] Hosted page id: ${result.hostedPageId}`);
  }
  console.log(`[deploy] Deploy config: ${result.deployConfigPath}`);
  if (Array.isArray(result.diagnostics) && result.diagnostics.length > 0) {
    console.log('[deploy] Diagnostics:');
    for (const line of result.diagnostics) {
      console.log(line);
    }
  }
}

await main();
