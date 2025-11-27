import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/create-app';
import { seedTestUser, clearTestUser, TEST_USER } from './seeds/users';

describe('Verenigingen (e2e)', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    app = await createTestApp();
    await seedTestUser((app as any).get('DrizzleAsyncProvider'));
    const res = await request(app.getHttpServer())
      .post('/api/session')
      .send({ email: TEST_USER.email, password: TEST_USER.password });
    token = res.body.token;
  });

  afterAll(async () => {
    await clearTestUser((app as any).get('DrizzleAsyncProvider'));
    await app.close();
  });

  it('GET /api/verenigingen should return 404 or 200', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/verenigingen')
      .set('Authorization', `Bearer ${token}`);

    expect([200, 404]).toContain(res.status);
  });
});
