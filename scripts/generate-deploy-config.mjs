import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {projectRoot} from './load-profile-env.mjs';

function readArg(argv, name) {
  const index = argv.findIndex((value) => value === `--${name}`);
  if (index === -1) {
    return '';
  }

  return argv[index + 1] ?? '';
}

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

  const pageName = readArg(process.argv.slice(2), 'page-name') || process.env.APP_HOSTED_PAGE_NAME;
  if (!pageName?.trim()) {
    throw new Error('Missing hosted page name. Provide --page-name or APP_HOSTED_PAGE_NAME.');
  }

  const outputPath =
    readArg(process.argv.slice(2), 'output') || path.resolve(projectRoot, 'coveo.deploy.json');
  const bundleRelativeDir = readArg(process.argv.slice(2), 'bundle-dir') || path.join('dist', 'bundle');

  const {createDeployConfig, writeDeployConfig} = await loadServiceModule();
  const config = createDeployConfig({
    hostedPageName: pageName,
    bundleRelativeDir,
  });

  await writeDeployConfig(outputPath, config);
  console.log(`[deploy-config] Wrote ${outputPath}`);
}

await main();
