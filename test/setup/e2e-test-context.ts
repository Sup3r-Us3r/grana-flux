import type { INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import request, { type Agent } from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../../src/presentation/modules/app-module';
import { resetTables } from './reset-db';

/**
 * E2E Test Context
 *
 * Provides isolated context for each E2E test suite with:
 * - NestJS application lifecycle management
 * - Database cleanup utilities
 */
export class E2ETestContext {
  private app: INestApplication<App>;
  private _request: Agent;

  private constructor(app: INestApplication<App>) {
    this.app = app;
    this._request = request(app.getHttpServer());
  }

  /**
   * Creates a new E2E test context with a fresh NestJS application.
   */
  static async create(): Promise<E2ETestContext> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    await app.init();

    return new E2ETestContext(app);
  }

  /**
   * Supertest request agent for making HTTP requests.
   */
  get request(): Agent {
    return this._request;
  }

  /**
   * The NestJS application server.
   */
  get httpServer() {
    return this.app.getHttpServer();
  }

  /**
   * Resets the database by truncating all tables.
   * Call this in beforeEach for complete isolation.
   */
  async resetTables(tables: string[]): Promise<void> {
    await resetTables(tables);
  }

  /**
   * Closes the application and cleans up resources.
   */
  async close(): Promise<void> {
    await this.app.close();
  }
}
