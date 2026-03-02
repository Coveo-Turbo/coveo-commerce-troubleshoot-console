import fs from 'node:fs/promises';
import path from 'node:path';
import {projectRoot} from './load-profile-env.mjs';

function applyPlaceholders(value, replacements) {
  if (typeof value === 'string') {
    return Object.entries(replacements).reduce(
      (accumulator, [token, replacement]) =>
        accumulator.replaceAll(token, replacement ?? ''),
      value
    );
  }

  if (Array.isArray(value)) {
    return value.map((item) => applyPlaceholders(item, replacements));
  }

  if (value && typeof value === 'object') {
    const record = value;
    const transformed = {};

    for (const [key, nestedValue] of Object.entries(record)) {
      transformed[key] = applyPlaceholders(nestedValue, replacements);
    }

    return transformed;
  }

  return value;
}

export async function generateDeployConfig({profileEnv, mainJsFile}) {
  const templatePath = path.resolve(projectRoot, 'coveo.deploy.template.json');
  const outputPath = path.resolve(projectRoot, 'coveo.deploy.json');

  const rawTemplate = await fs.readFile(templatePath, 'utf8');
  const template = JSON.parse(rawTemplate);

  const generated = applyPlaceholders(template, {
    '${APP_HOSTED_PAGE_NAME}': profileEnv.APP_HOSTED_PAGE_NAME,
    '${APP_HOSTED_PAGE_ID}': profileEnv.APP_HOSTED_PAGE_ID || '',
    '${MAIN_JS_FILE}': mainJsFile,
  });

  await fs.writeFile(outputPath, `${JSON.stringify(generated, null, 2)}\n`, 'utf8');
  return outputPath;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.error('This script is intended to be used by build-hosted.mjs');
  process.exit(1);
}
