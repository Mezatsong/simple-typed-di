import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // The "Quality Gate"
      thresholds: {
        lines: 90,
        functions: 100,
        branches: 85,
        statements: 90,
      },
    },
  },
});
