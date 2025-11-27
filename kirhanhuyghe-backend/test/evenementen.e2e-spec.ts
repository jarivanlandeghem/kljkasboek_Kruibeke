import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/create-app';
import { seedTestUser, clearTestUser, TEST_USER } from './seeds/users';

describe('Evenementen (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let createdId: number | null = null;

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
        .delete(`/api/evenementen/${createdId}`)
        .set('Authorization', `Bearer ${token}`);
    }
    await clearTestUser((app as any).get('DrizzleAsyncProvider'));
    await app.close();
  });

  it('POST /api/evenementen -> create and GET list', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/evenementen')
      .set('Authorization', `Bearer ${token}`)
      .send({
        type: 'ACTIVITEIT',
        naam: 'e2e test event',
        beschrijving: 'test',
        datum: '2025-12-01',
        startuur: '10:00:00',
        einduur: '12:00:00',
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body).toHaveProperty('evenementID');
    createdId = createRes.body.evenementID;

    const listRes = await request(app.getHttpServer())
      .get('/api/evenementen')
      .set('Authorization', `Bearer ${token}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveProperty('items');
    expect(Array.isArray(listRes.body.items)).toBe(true);
  });
});
