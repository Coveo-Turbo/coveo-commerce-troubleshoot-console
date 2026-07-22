import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(__filename), '..');

function runNpm(args) {
  const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(command, args, {cwd: projectRoot, stdio: 'inherit'});
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

async function main() {
  // Produce the production app bundle (dist/assets/app-*.js + app-*.css).
  runNpm(['run', 'build']);

  const assetsDir = path.resolve(projectRoot, 'dist', 'assets');
  const outDir = path.resolve(projectRoot, 'cdn', 'app');

  const assetFiles = await fs.readdir(assetsDir);
  const jsFiles = assetFiles.filter((file) => file.endsWith('.js')).sort();
  const cssFiles = assetFiles.filter((file) => file.endsWith('.css')).sort();

  if (jsFiles.length === 0) {
    throw new Error('Expected at least one JS asset file in dist/assets.');
  }
  if (jsFiles.length > 1) {
    throw new Error(
      `Expected a single JS chunk for URL hosting but found ${jsFiles.length}: ${jsFiles.join(', ')}. ` +
        'External-URL hosting requires a self-contained bundle (no code splitting).'
    );
  }
  if (cssFiles.length === 0) {
    throw new Error('Expected at least one CSS asset file in dist/assets.');
  }

  await fs.mkdir(outDir, {recursive: true});
  await fs.copyFile(path.resolve(assetsDir, jsFiles[0]), path.resolve(outDir, 'app.js'));
  await fs.copyFile(path.resolve(assetsDir, cssFiles[0]), path.resolve(outDir, 'main.css'));

  console.log('[cdn] Wrote cdn/app/app.js and cdn/app/main.css');
  console.log('[cdn] Commit these files, then pin commit URLs, e.g.:');
  console.log('  APP_APP_BUNDLE_URL=https://cdn.jsdelivr.net/gh/<owner>/<repo>@<commit>/cdn/app/app.js');
  console.log('  APP_STYLES_URL=https://cdn.jsdelivr.net/gh/<owner>/<repo>@<commit>/cdn/app/main.css');
}

await main();
