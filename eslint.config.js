import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

/**
 * =============================================================================
 * ESLint Configuration (Flat Config)
 * =============================================================================
 * Modern ESLint 9.x configuration
 * - TypeScript support with @typescript-eslint
 * - ES2024 target
 * - Strict rules for code quality
 * =============================================================================
 */

export default [
  {
    files: ['onboard/src/**/*.ts', 'onboard/src/**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        project: './tsconfig.json'
      },
      globals: {
        console: 'readonly',
        document: 'readonly',
        window: 'readonly',
        HTMLElement: 'readonly',
        Element: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
        EventTarget: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs['recommended-requiring-type-checking'].rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'prefer-const': 'error',
      'no-var': 'error'
    }
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '_site/**',
      'api/**',
      '*.min.js',
      'vendor/**',
      '_sass/**',
      'css/**',
      'onboard/assets/dist/**',
      '_tests_/**',
      '*.config.js',
      '*.config.ts'
    ]
  }
];
