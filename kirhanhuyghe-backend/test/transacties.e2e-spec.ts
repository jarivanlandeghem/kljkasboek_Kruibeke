import { INestApplication } from '@nestjs/common';
import {
  DatabaseProvider,
  DrizzleAsyncProvider,
} from '../src/drizzle/drizzle.provider';
import { createTestApp } from './helpers/create-app';
import {
  seedTransacties,
  clearTransacties,
  TRANSACTIES_SEED,
} from './seeds/transacties';
import { seedTestUser, clearTestUser, TEST_USER } from './seeds/users';
import request from 'supertest';

describe('Transacties', () => {
  let app: INestApplication;
  let drizzle: DatabaseProvider;
  let authToken: string;

  const url = '/api/transacties';

  beforeAll(async () => {
    app = await createTestApp();
    drizzle = app.get(DrizzleAsyncProvider);

    // Seed test user and transacties
    await seedTestUser(drizzle);
    await seedTransacties(drizzle);

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/session')
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    authToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await clearTransacties(drizzle);
    await clearTestUser(drizzle);
    await app.close();
  });

  describe('GET /api/transacties', () => {
    it('should 200 and return all transactions', async () => {
      const response = await request(app.getHttpServer())
        .get(url)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.statusCode).toBe(200);
      expect(response.body.items).toBeInstanceOf(Array);
      expect(response.body.items.length).toBeGreaterThanOrEqual(
        TRANSACTIES_SEED.length,
      );
    });
  });
});
