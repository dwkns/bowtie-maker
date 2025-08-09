import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Define two test projects: one for unit tests and one for browser tests
    projects: [
      {
        name: 'unit',
        environment: 'node',
        include: ['test/unit/**/*.{test,spec}.{js,ts}'],
      },
      {
        name: 'browser',
        environment: 'browser',
        include: ['test/browser/**/*.{test,spec}.{js,ts}'],
        browser: {
          enabled: true,
          provider: 'playwright',
          name: 'chromium',
          // Headless by default, but can be configured for debugging
          headless: process.env.CI ? true : false,
          // Support for our SVG manipulations
          providerOptions: {
            viewport: { width: 1024, height: 768 },
          },
        },
      },
    ],
    setupFiles: ['./test/setup.js'],
    // Add coverage reporting
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.js'],
      exclude: ['test/**/*', 'node_modules/**/*'],
    },
  },
});