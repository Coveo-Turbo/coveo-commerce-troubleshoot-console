import './generated-config.js';
import troubleshootStyles from '../src/styles/main.css?inline';

const ATOMIC_THEME_URL = 'https://static.cloud.coveo.com/atomic/v3/themes/coveo.css';
const GOOGLE_FONTS_URL =
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Space+Grotesk:wght@400;500;600;700&display=swap';

function ensureDocumentFonts() {
  if (!document.head.querySelector('link[data-hosted-local-fonts="true"]')) {
    const fonts = document.createElement('link');
    fonts.rel = 'stylesheet';
    fonts.href = GOOGLE_FONTS_URL;
    fonts.dataset.hostedLocalFonts = 'true';
    document.head.append(fonts);
  }
}

function ensureShadowStyles(root) {
  const ensureLink = (id, href) => {
    if (root.getElementById(id) || root.querySelector(`link[href="${href}"]`)) {
      return;
    }

    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    root.append(link);
  };

  if (!root.getElementById('hosted-local-main-css')) {
    const style = document.createElement('style');
    style.id = 'hosted-local-main-css';
    style.textContent = troubleshootStyles;
    root.append(style);
  }

  ensureLink('hosted-local-atomic-theme', ATOMIC_THEME_URL);
}

const host = document.querySelector('#hosted-ui');
if (host) {
  const root = host.attachShadow({mode: 'open'});
  ensureDocumentFonts();
  ensureShadowStyles(root);

  // Simulate hosted markup arriving after script start.
  window.setTimeout(() => {
    const mount = document.createElement('div');
    mount.setAttribute('data-template', 'troubleshoot');
    root.append(mount);
  }, 300);
}

await import('../src/main.ts');
