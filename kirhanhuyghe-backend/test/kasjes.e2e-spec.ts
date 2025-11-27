import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/create-app';
import { seedTestUser, clearTestUser, TEST_USER } from './seeds/users';

describe('Kasjes (e2e)', () => {
  let app: INestApplication;
  let token: string;
  const createdId: number | null = null;

  beforeAll(async () => {
    app = await createTestApp();
    await seedTestUser((app as any).get('DrizzleAsyncProvider'));
    const res = await request(app.getHttpServer())
      .post('/api/session')
      .send({ email: TEST_USER.email, password: TEST_USER.password });
    token = res.body.token;
  });

  afterAll(async () => {
    if (createdId) {
      await request(app.getHttpServer())
        .delete(`/api/kasjes/${createdId}`)
        .set('Authorization', `Bearer ${token}`);
    }
    await clearTestUser((app as any).get('DrizzleAsyncProvider'));
    await app.close();
  });

  it('GET /api/kasjes (list)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/kasjes')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});
