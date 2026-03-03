import {defineConfig} from 'vite';

export default defineConfig({
  envPrefix: ['VITE_', 'APP_'],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        app: 'index.html',
      },
    },
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
    globals: true,
    restoreMocks: true,
    clearMocks: true,
  },
});
