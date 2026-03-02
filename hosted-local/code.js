import './generated-config.js';

const host = document.querySelector('#hosted-ui');
if (host) {
  const root = host.attachShadow({mode: 'open'});

  // Simulate hosted markup arriving after script start.
  window.setTimeout(() => {
    const mount = document.createElement('div');
    mount.setAttribute('data-template', 'troubleshoot');
    root.append(mount);
  }, 300);
}

await import('../src/main.ts');
