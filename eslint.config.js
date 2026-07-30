import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
      'prefer-const': 'error',
    },
  },
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/migrations/**', '**/__tests__/**', 'eslint.config.js', '**/drizzle.config.ts', '**/vitest.config.ts', '**/playwright.config.ts'],
  },
);
