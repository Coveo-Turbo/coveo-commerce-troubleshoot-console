import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const packageJsonPath = path.resolve(
  projectRoot,
  'packages',
  'commerce-troubleshoot-deployer',
  'package.json'
);

function extractBodyMarkup(indexHtml) {
  const match = indexHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!match) {
    throw new Error('Unable to extract <body> from dist/index.html');
  }

  return match[1].replace(/<script[\s\S]*?<\/script>/gi, '').trim();
}

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function readBytes(filePath) {
  return fs.readFile(filePath);
}

async function ensureBuild() {
  const build = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'build'], {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  if (build.status !== 0) {
    process.exit(build.status ?? 1);
  }
}

async function main() {
  await ensureBuild();

  const distDir = path.resolve(projectRoot, 'dist');
  const assetsDir = path.resolve(distDir, 'assets');
  const templateDir = path.resolve(
    projectRoot,
    'packages',
    'commerce-troubleshoot-deployer',
    'assets',
    'template'
  );

  await fs.rm(templateDir, {recursive: true, force: true});
  await fs.mkdir(path.resolve(templateDir, 'js'), {recursive: true});
  await fs.mkdir(path.resolve(templateDir, 'styles'), {recursive: true});

  const indexHtml = await fs.readFile(path.resolve(distDir, 'index.html'), 'utf8');
  const bodyMarkup = `${extractBodyMarkup(indexHtml)}\n`;
  await fs.writeFile(path.resolve(templateDir, 'troubleshoot.html'), bodyMarkup, 'utf8');

  const assetFiles = await fs.readdir(assetsDir);
  const jsFiles = assetFiles.filter((file) => file.endsWith('.js')).sort();
  const cssFiles = assetFiles.filter((file) => file.endsWith('.css')).sort();

  if (jsFiles.length === 0) {
    throw new Error('Expected at least one JS asset file in dist/assets.');
  }

  if (cssFiles.length === 0) {
    throw new Error('Expected at least one CSS asset file in dist/assets.');
  }

  const jsSourcePath = path.resolve(assetsDir, jsFiles[0]);
  const cssSourcePath = path.resolve(assetsDir, cssFiles[0]);

  await fs.copyFile(jsSourcePath, path.resolve(templateDir, 'js', 'app.js'));
  await fs.copyFile(cssSourcePath, path.resolve(templateDir, 'styles', 'main.css'));

  const [troubleshootHtml, appJs, mainCss, rawPkg] = await Promise.all([
    readBytes(path.resolve(templateDir, 'troubleshoot.html')),
    readBytes(path.resolve(templateDir, 'js', 'app.js')),
    readBytes(path.resolve(templateDir, 'styles', 'main.css')),
    fs.readFile(packageJsonPath, 'utf8'),
  ]);

  const pkg = JSON.parse(rawPkg);
  const manifest = {
    version: String(pkg.version || '0.0.0'),
    files: {
      'troubleshoot.html': {
        sha256: sha256(troubleshootHtml),
        bytes: troubleshootHtml.byteLength,
      },
      'js/app.js': {
        sha256: sha256(appJs),
        bytes: appJs.byteLength,
      },
      'styles/main.css': {
        sha256: sha256(mainCss),
        bytes: mainCss.byteLength,
      },
    },
  };

  await fs.writeFile(path.resolve(templateDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  console.log(`[artifact] Template generated at ${templateDir}`);
}

await main();
