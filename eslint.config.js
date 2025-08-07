export const ignores = ['.next/', 'generated/', 'prisma/', 'node_modules/'];
// Migrated from .eslintrc.json for ESLint v9+
import next from '@next/eslint-plugin-next';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-plugin-prettier';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier,
      next: next,
      'react-hooks': reactHooks,
    },
    rules: {
      ...Object.fromEntries(
        Object.entries(next.configs['core-web-vitals'].rules).map(([key, value]) => [
          key.replace('@next/next/', 'next/'),
          value,
        ]),
      ),
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-console': 'warn',
      'next/no-img-element': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'prettier/prettier': 'error',
    },
    settings: {
      react: { version: 'detect' },
    },
  },
];
