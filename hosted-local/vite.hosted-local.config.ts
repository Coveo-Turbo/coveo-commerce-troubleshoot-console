import {defineConfig} from 'vite';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');

export default defineConfig({
  root: __dirname,
  publicDir: false,
  server: {
    fs: {
      allow: [workspaceRoot],
    },
  },
  preview: {
    host: '127.0.0.1',
  },
});
