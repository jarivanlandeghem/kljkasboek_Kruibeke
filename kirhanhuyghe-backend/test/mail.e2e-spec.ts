import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/create-app';
import { seedTestUser, clearTestUser, TEST_USER } from './seeds/users';

describe('Mail (e2e) - sanity check', () => {
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

  it('No mail controller present; calling /api/mail should return 404', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/mail')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect([404, 405]).toContain(res.status);
  });
});
