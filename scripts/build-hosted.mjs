import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {
  getProfileFromArgv,
  loadProfileEnv,
  mapProfileToRuntimeConfig,
  projectRoot,
  writeGeneratedRuntimeConfig,
} from './load-profile-env.mjs';
import {generateDeployConfig} from './generate-deploy-config.mjs';

function copyFile(source, target) {
  return fs.copyFile(source, target);
}

function extractBodyMarkup(indexHtml) {
  const match = indexHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!match) {
    throw new Error('Unable to extract <body> from dist/index.html');
  }

  return match[1].replace(/<script[\s\S]*?<\/script>/gi, '').trim();
}

async function buildHostedArtifacts(profileEnv) {
  const distDir = path.resolve(projectRoot, 'dist');
  const assetsDir = path.resolve(distDir, 'assets');
  const bundleDir = path.resolve(distDir, 'bundle');
  const bundleJsDir = path.resolve(bundleDir, 'js');
  const bundleStylesDir = path.resolve(bundleDir, 'styles');

  await fs.mkdir(bundleJsDir, {recursive: true});
  await fs.mkdir(bundleStylesDir, {recursive: true});

  const indexHtml = await fs.readFile(path.resolve(distDir, 'index.html'), 'utf8');
  const bodyMarkup = extractBodyMarkup(indexHtml);
  await fs.writeFile(path.resolve(bundleDir, 'troubleshoot.html'), `${bodyMarkup}\n`, 'utf8');

  const assetFiles = await fs.readdir(assetsDir);
  const jsFiles = assetFiles.filter((file) => file.endsWith('.js'));
  const cssFiles = assetFiles.filter((file) => file.endsWith('.css'));

  if (jsFiles.length === 0) {
    throw new Error('Expected at least one JS file in dist/assets.');
  }

  if (jsFiles.length > 1) {
    throw new Error(
      `Expected a single JS entry for hosted packaging, found: ${jsFiles.join(', ')}`
    );
  }

  const mainJsFile = jsFiles[0];
  await copyFile(path.resolve(assetsDir, mainJsFile), path.resolve(bundleJsDir, mainJsFile));

  if (cssFiles.length === 0) {
    throw new Error('Expected at least one CSS file in dist/assets.');
  }

  await copyFile(path.resolve(assetsDir, cssFiles[0]), path.resolve(bundleStylesDir, 'main.css'));

  const deployConfigPath = await generateDeployConfig({
    profileEnv,
    mainJsFile,
  });

  return {
    bundleDir,
    deployConfigPath,
    mainJsFile,
  };
}

async function main() {
  const profile = getProfileFromArgv();
  const {env} = await loadProfileEnv(profile);

  const runtimeConfig = mapProfileToRuntimeConfig(env);
  await writeGeneratedRuntimeConfig(runtimeConfig);

  const build = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  if (build.status !== 0) {
    process.exit(build.status ?? 1);
  }

  const result = await buildHostedArtifacts(env);

  console.log(`[hosted] Bundle directory: ${result.bundleDir}`);
  console.log(`[hosted] Main JS: ${result.mainJsFile}`);
  console.log(`[hosted] Deploy config: ${result.deployConfigPath}`);
}

await main();
