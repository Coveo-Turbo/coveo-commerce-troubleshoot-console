import fs from 'node:fs/promises';
import path from 'node:path';

const ATOMIC_SCRIPT_URL = 'https://static.cloud.coveo.com/atomic/v3.60.0/atomic.esm.js';
const ATOMIC_THEME_URL = 'https://static.cloud.coveo.com/atomic/v3.60.0/themes/coveo.css';
const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';

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
  customComponentsUrl?: string;
  appBundleUrl?: string;
  stylesUrl?: string;
}): CoveoDeployConfig {
  const appBundleUrl = options.appBundleUrl?.trim();
  const stylesUrl = options.stylesUrl?.trim();

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
      // The app bundle is inlined by default. When appBundleUrl is provided it is served
      // from an external URL instead, keeping the large bundle out of the Hosted Page API
      // request body (avoids WAF request-body inspection false positives).
      ...(appBundleUrl
        ? []
        : [
            {
              path: 'js/app.js',
              isModule: true,
            },
          ]),
    ],
    javascriptUrls: [
      ...(appBundleUrl ? [{path: appBundleUrl, isModule: true}] : []),
      {
        path: ATOMIC_SCRIPT_URL,
        isModule: true,
      },
      ...(options.customComponentsUrl
        ? [{path: options.customComponentsUrl, isModule: true}]
        : []),
    ],
    cssEntryFiles: [
      // main.css is inlined by default; externalized to a URL when stylesUrl is provided.
      ...(stylesUrl
        ? []
        : [
            {
              path: 'styles/main.css',
            },
          ]),
    ],
    cssUrls: [
      ...(stylesUrl ? [{path: stylesUrl}] : []),
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
