import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'vite';

const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(__filename), '..');

await build({
  configFile: false,
  root: projectRoot,
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    lib: {
      entry: path.resolve(projectRoot, 'src/components/demo-product-components-entry.ts'),
      formats: ['es'],
      fileName: () => 'demo-product-components.js',
    },
    outDir: path.resolve(projectRoot, 'cdn'),
    emptyOutDir: false,
    minify: true,
    sourcemap: false,
  },
});

console.log('[cdn] Component bundle written to cdn/demo-product-components.js');
