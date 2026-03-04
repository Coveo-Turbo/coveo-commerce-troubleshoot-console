import {spawnSync} from 'node:child_process';
import type {DeployExecutionOptions, DeployExecutor, DeployResult} from './types.js';

function resolveCommand() {
  return process.platform === 'win32' ? 'coveo.cmd' : 'coveo';
}

function extractHostedPageId(output: string): string | undefined {
  const match = output.match(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/i);
  return match?.[0];
}

export class CoveoCliDeployExecutor implements DeployExecutor {
  public async deploy(
    configPath: string,
    cwd = process.cwd(),
    options: DeployExecutionOptions = {}
  ): Promise<DeployResult> {
    const command = resolveCommand();
    const args = ['ui:deploy', '--config', configPath];
    if (options.pageId?.trim()) {
      args.push('--pageId', options.pageId.trim());
    }

    const result = spawnSync(command, args, {
      cwd,
      encoding: 'utf8',
    });

    const stdout = result.stdout ?? '';
    const stderr = result.stderr ?? '';

    if (result.status !== 0) {
      throw new Error(
        [`Hosted deploy failed (exit ${result.status ?? 'unknown'}).`, stdout.trim(), stderr.trim()]
          .filter(Boolean)
          .join('\n')
      );
    }

    const hostedPageId = extractHostedPageId(stdout);

    return {
      stdout,
      stderr,
      ...(hostedPageId ? {hostedPageId} : {}),
    };
  }
}
