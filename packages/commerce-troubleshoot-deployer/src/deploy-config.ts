import fs from 'node:fs/promises';
import path from 'node:path';

const ATOMIC_SCRIPT_URL = 'https://static.cloud.coveo.com/atomic/v3/atomic.esm.js';
const ATOMIC_THEME_URL = 'https://static.cloud.coveo.com/atomic/v3/themes/coveo.css';
const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap';

export type CoveoDeployConfig = {
  name: string;
  dir: string;
  htmlEntryFile: {
    path: string;
  };
  javascriptEntryFiles: Array<{
    path: string;
    isModule: boolean;
  }>;
  javascriptUrls: Array<{
    path: string;
    isModule: boolean;
  }>;
  cssEntryFiles: Array<{
    path: string;
  }>;
  cssUrls: Array<{
    path: string;
  }>;
  schemaVersion: '1.0.0';
};

export function createDeployConfig(options: {
  hostedPageName: string;
  bundleRelativeDir: string;
}): CoveoDeployConfig {
  return {
    name: options.hostedPageName,
    dir: options.bundleRelativeDir,
    htmlEntryFile: {
      path: 'troubleshoot.html',
    },
    javascriptEntryFiles: [
      {
        path: 'js/runtime-config.js',
        isModule: true,
      },
      {
        path: 'js/app.js',
        isModule: true,
      },
    ],
    javascriptUrls: [
      {
        path: ATOMIC_SCRIPT_URL,
        isModule: true,
      },
    ],
    cssEntryFiles: [
      {
        path: 'styles/main.css',
      },
    ],
    cssUrls: [
      {
        path: ATOMIC_THEME_URL,
      },
      {
        path: GOOGLE_FONTS_URL,
      },
    ],
    schemaVersion: '1.0.0',
  };
}

export async function writeDeployConfig(configPath: string, config: CoveoDeployConfig) {
  await fs.mkdir(path.dirname(configPath), {recursive: true});
  await fs.writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8');
}
