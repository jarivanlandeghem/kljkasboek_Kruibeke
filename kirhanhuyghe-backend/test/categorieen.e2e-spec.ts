import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/create-app';
import { seedTestUser, clearTestUser, TEST_USER } from './seeds/users';

describe('Categorieën (e2e)', () => {
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
        .delete(`/api/categorieen/${createdId}`)
        .set('Authorization', `Bearer ${token}`);
    }
    await clearTestUser((app as any).get('DrizzleAsyncProvider'));
    await app.close();
  });

  it('POST /api/categorieen (create)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/categorieen')
      .set('Authorization', `Bearer ${token}`)
      .send({ categorienaam: 'e2e test category' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('categorieID');
    createdId = res.body.categorieID;
  });

  it('GET /api/categorieen (list)', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/categorieen')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
  });
});
