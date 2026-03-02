import fs from 'node:fs/promises';
import path from 'node:path';
import {
  getProfileFromArgv,
  loadProfileEnv,
  mapProfileToRuntimeConfig,
  projectRoot,
  writeGeneratedRuntimeConfig,
} from './load-profile-env.mjs';

async function main() {
  const profile = getProfileFromArgv();
  const {env} = await loadProfileEnv(profile);
  const runtimeConfig = mapProfileToRuntimeConfig(env);

  await writeGeneratedRuntimeConfig(runtimeConfig);

  const outputPath = path.resolve(projectRoot, 'hosted-local', 'generated-config.js');
  const content = `window.__APP_CONFIG = ${JSON.stringify(runtimeConfig, null, 2)};\n`;
  await fs.writeFile(outputPath, content, 'utf8');

  console.log(`[hosted-local] Prepared profile "${profile}" at ${outputPath}`);
}

await main();
