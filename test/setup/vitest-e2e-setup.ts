import 'dotenv/config';

import { execSync } from 'node:child_process';
import { closePrismaConnection } from './reset-db';

/**
 * Global E2E Test Setup
 *
 * Runs once before all E2E test files.
 * - Ensures database migrations are applied
 * - Sets up environment variables
 */
export async function setup() {
  process.env.DATABASE_URL = process.env.E2E_DATABASE_URL;

  console.log('🔄 Running database migrations...');

  execSync('npx prisma migrate reset --force && npx prisma migrate deploy', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: process.env.E2E_DATABASE_URL,
    },
  });

  console.log('✅ Migrations applied successfully');
}

/**
 * Global E2E Test Teardown
 *
 * Runs once after all E2E test files complete.
 * - Closes database connections
 */
export async function teardown() {
  console.log('🧹 Cleaning up E2E test resources...');
  await closePrismaConnection();
  console.log('✅ Cleanup complete');
}
