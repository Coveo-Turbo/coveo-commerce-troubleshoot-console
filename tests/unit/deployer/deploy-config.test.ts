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

  it('externalizes the app bundle to a URL when appBundleUrl is provided', () => {
    const config = createDeployConfig({
      hostedPageName: 'my-page',
      bundleRelativeDir: 'dist/bundle',
      appBundleUrl: 'https://cdn.example.com/app.js',
    });

    // runtime-config stays inline; app.js is no longer an inlined entry file.
    expect(config.javascriptEntryFiles).toEqual([{path: 'js/runtime-config.js', isModule: true}]);
    expect(config.javascriptEntryFiles).not.toContainEqual({path: 'js/app.js', isModule: true});
    // app URL loads before the Atomic script.
    expect(config.javascriptUrls[0]).toEqual({path: 'https://cdn.example.com/app.js', isModule: true});
  });

  it('externalizes the stylesheet to a URL when stylesUrl is provided', () => {
    const config = createDeployConfig({
      hostedPageName: 'my-page',
      bundleRelativeDir: 'dist/bundle',
      stylesUrl: 'https://cdn.example.com/main.css',
    });

    expect(config.cssEntryFiles).toEqual([]);
    expect(config.cssUrls[0]).toEqual({path: 'https://cdn.example.com/main.css'});
  });
});
