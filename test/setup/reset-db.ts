import { PrismaClient } from '@infra/database/prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

let prismaInstance: PrismaClient | null = null;
let poolInstance: Pool | null = null;

/**
 * Gets or creates a singleton Prisma client for E2E tests.
 */
export function getTestPrisma(): PrismaClient {
  if (!prismaInstance) {
    const connectionString = process.env.E2E_DATABASE_URL;

    if (!connectionString) {
      throw new Error('E2E_DATABASE_URL environment variable is not set');
    }

    poolInstance = new Pool({ connectionString });
    const adapter = new PrismaPg(poolInstance);
    prismaInstance = new PrismaClient({ adapter });
  }

  return prismaInstance;
}

/**
 * Resets the database by truncating all tables.
 * This ensures each test starts with a clean state.
 */
export async function resetTables(tables: string[]): Promise<void> {
  const prisma = getTestPrisma();

  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      ${tables.join(', ')}
    RESTART IDENTITY CASCADE;
  `);
}

/**
 * Closes the Prisma connection pool.
 * Should be called after all tests complete.
 */
export async function closePrismaConnection(): Promise<void> {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }

  if (poolInstance) {
    await poolInstance.end();
    poolInstance = null;
  }
}
