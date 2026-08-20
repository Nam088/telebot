import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/telegram/**/*.ts', 'src/ext/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/**/types.ts', 'src/index.ts', 'src/telegram/index.ts', 'src/ext/index.ts', 'src/utils/index.ts'],
      thresholds: {
        lines: 80,
      },
    },
  },
});
