import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    target: 'node22',
  },
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/client/types.ts', 'src/**/index.ts', 'src/utils/index.ts'],
      thresholds: {
        lines: 80,
      },
    },
  },
});
