import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type {TemplateManifest} from './types.js';

async function copyDir(sourceDir: string, targetDir: string): Promise<void> {
  await fs.mkdir(targetDir, {recursive: true});
  const entries = await fs.readdir(sourceDir, {withFileTypes: true});

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await copyDir(sourcePath, targetPath);
      continue;
    }

    if (entry.isFile()) {
      await fs.copyFile(sourcePath, targetPath);
    }
  }
}

async function sha256ForFile(filePath: string) {
  const value = await fs.readFile(filePath);
  return crypto.createHash('sha256').update(value).digest('hex');
}

async function readTemplateManifest(templateDir: string): Promise<TemplateManifest | null> {
  const manifestPath = path.join(templateDir, 'manifest.json');
  try {
    const raw = await fs.readFile(manifestPath, 'utf8');
    const parsed = JSON.parse(raw) as TemplateManifest;
    if (!parsed?.files || typeof parsed.files !== 'object') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

async function validateTemplate(templateDir: string): Promise<void> {
  const requiredFiles = ['troubleshoot.html', 'js/app.js', 'styles/main.css'];
  for (const requiredFile of requiredFiles) {
    await fs.access(path.join(templateDir, requiredFile));
  }

  const manifest = await readTemplateManifest(templateDir);
  if (!manifest) {
    return;
  }

  for (const [relativePath, descriptor] of Object.entries(manifest.files)) {
    const filePath = path.join(templateDir, relativePath);
    const [stats, hash] = await Promise.all([fs.stat(filePath), sha256ForFile(filePath)]);

    if (stats.size !== descriptor.bytes) {
      throw new Error(`Template file size mismatch for ${relativePath}.`);
    }

    if (hash !== descriptor.sha256) {
      throw new Error(`Template checksum mismatch for ${relativePath}.`);
    }
  }
}

async function createWorkspaceRoot(baseDir: string | undefined) {
  if (baseDir?.trim()) {
    await fs.mkdir(baseDir, {recursive: true});
    return baseDir;
  }

  return fs.mkdtemp(path.join(os.tmpdir(), 'ctc-deployer-'));
}

export async function materializeBundle(options: {
  templateDir: string;
  runtimeConfigContent: string;
  outputRootDir?: string;
  bundleRelativeDir?: string;
  deployConfigRelativePath?: string;
}) {
  const workspaceRoot = await createWorkspaceRoot(options.outputRootDir);
  const bundleRelativeDir = options.bundleRelativeDir?.trim() || 'bundle';
  const deployConfigRelativePath = options.deployConfigRelativePath?.trim() || 'coveo.deploy.json';
  const bundleDir = path.resolve(workspaceRoot, bundleRelativeDir);
  const deployConfigPath = path.resolve(workspaceRoot, deployConfigRelativePath);

  await validateTemplate(options.templateDir);

  await fs.rm(bundleDir, {recursive: true, force: true});
  await copyDir(options.templateDir, bundleDir);

  const runtimeConfigPath = path.join(bundleDir, 'js', 'runtime-config.js');
  await fs.mkdir(path.dirname(runtimeConfigPath), {recursive: true});
  await fs.writeFile(runtimeConfigPath, options.runtimeConfigContent, 'utf8');

  return {
    workspaceRoot,
    bundleDir,
    deployConfigPath,
    runtimeConfigPath,
    bundleRelativeDir,
  };
}
