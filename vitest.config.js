import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '_site/',
        '**/*.test.js',
        '**/*.spec.js',
        'vitest.config.js',
        'eleventy.config.js'
      ]
    }
  },
  esbuild: {
    target: 'es2022'
  }
});
