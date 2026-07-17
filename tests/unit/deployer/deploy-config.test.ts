import {describe, expect, it} from 'vitest';
import {createDeployConfig} from '../../../packages/commerce-troubleshoot-deployer/src/deploy-config';

describe('deploy-config', () => {
  it('creates deploy config with runtime config loaded before app script', () => {
    const config = createDeployConfig({
      hostedPageName: 'my-page',
      bundleRelativeDir: 'dist/bundle',
    });

    expect(config.name).toBe('my-page');
    expect(config.dir).toBe('dist/bundle');
    expect(config.javascriptEntryFiles).toEqual([
      {path: 'js/runtime-config.js', isModule: true},
      {path: 'js/app.js', isModule: true},
    ]);
  });

  it('adds the optional custom component bundle as an external module', () => {
    const config = createDeployConfig({
      hostedPageName: 'my-page',
      bundleRelativeDir: 'dist/bundle',
      customComponentsUrl: 'https://cdn.example.com/demo-components.js',
    });

    expect(config.javascriptUrls).toContainEqual({
      path: 'https://cdn.example.com/demo-components.js',
      isModule: true,
    });
  });
});
