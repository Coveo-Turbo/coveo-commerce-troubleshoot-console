import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      'hosted-local/generated-config.js',
      'src/app/runtime-config.generated.ts',
      'packages/commerce-troubleshoot-deployer/dist',
      'packages/commerce-troubleshoot-deployer/assets/template/js/app.js',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.js', '**/*.mjs'],
    rules: {
      'no-undef': 'off',
    },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  }
);
