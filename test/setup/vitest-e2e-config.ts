import path from 'node:path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*-e2e.spec.ts'],
    globals: true,
    root: path.resolve(__dirname, '../..'),

    // Run test files sequentially to avoid database conflicts
    // Tests within a file still run sequentially by default
    fileParallelism: false,

    // Use forks for better isolation between test files
    pool: 'forks',

    // Increase timeouts for database operations
    testTimeout: 30000,
    hookTimeout: 30000,

    // Global setup runs migrations once before all tests
    globalSetup: './test/setup/vitest-e2e-setup.ts',

    alias: {
      '@domain': path.resolve(__dirname, '../../src/domain'),
      '@application': path.resolve(__dirname, '../../src/application'),
      '@infra': path.resolve(__dirname, '../../src/infrastructure'),
      '@presentation': path.resolve(__dirname, '../../src/presentation'),
      '@shared': path.resolve(__dirname, '../../src/shared'),
      '@test': path.resolve(__dirname, '../../test'),
    },
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});
