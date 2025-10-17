import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';

/**
 * =============================================================================
 * Vite Configuration
 * =============================================================================
 * Modern build tooling for Onboard dashboard
 * - Fast HMR (Hot Module Replacement)
 * - TypeScript type checking
 * - ESLint integration
 * - ES2024 target
 * =============================================================================
 */

export default defineConfig({
  root: '.',

  build: {
    outDir: 'onboard/assets/dist',
    emptyOutDir: false,
    target: 'es2024',

    rollupOptions: {
      input: 'onboard/src/main.ts',
      output: {
        entryFileNames: 'editor.bundle.js',
        format: 'es',
        compact: true
      }
    },

    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true
      },
      format: {
        comments: false
      }
    }
  },

  plugins: [
    checker({
      typescript: {
        tsconfigPath: './tsconfig.json'
      }
      // ESLint disabled during build to avoid blocking on warnings
      // Run `pnpm lint` separately to check code quality
    })
  ],

  server: {
    port: 5173,
    open: false,
    strictPort: false
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json']
  }
});
