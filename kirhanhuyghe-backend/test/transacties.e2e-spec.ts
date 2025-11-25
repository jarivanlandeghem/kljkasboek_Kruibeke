// test/places.e2e-spec.ts
import { INestApplication } from '@nestjs/common';
import {
  DatabaseProvider,
  DrizzleAsyncProvider,
} from '../src/drizzle/drizzle.provider'; // 👈 1
import { createTestApp } from './helpers/create-app';
import {
  seedTransacties,
  clearTransacties,
  TRANSACTIES_SEED,
} from './seeds/transacties';
import request from 'supertest';

describe('Places', () => {
  let app: INestApplication;
  let drizzle: DatabaseProvider; // 👈 1

  const url = '/api/transactions';

  beforeAll(async () => {
    app = await createTestApp();
    drizzle = app.get(DrizzleAsyncProvider); // 👈 2

    await seedTransacties(drizzle); // 👈 3
  });

  afterAll(async () => {
    await clearTransacties(drizzle); // 👈 4
    await app.close();
  });
  describe('GET /api/transactions', () => {
    it('should 200 and return all transactions', async () => {
      const response = await request(app.getHttpServer()).get(url);

      expect(response.statusCode).toBe(200);
      expect(response.body.items).toEqual(
        expect.arrayContaining(TRANSACTIES_SEED),
      );
    });
  });
});
