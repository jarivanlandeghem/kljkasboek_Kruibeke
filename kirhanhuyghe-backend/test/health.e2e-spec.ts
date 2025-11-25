import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import request from 'supertest';

//TODO expected 200, received 404 (toBe)
describe('Health', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  describe('GET /api/health/ping', () => {
    const url = '/api/health/ping';

    // 👇 1
    it('should return pong', async () => {
      const response = await request(app.getHttpServer()).get(url); // 👈 2

      expect(response.statusCode).toBe(200); // 👈 3
      expect(response.body).toEqual({ pong: true }); // 👈 3
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
