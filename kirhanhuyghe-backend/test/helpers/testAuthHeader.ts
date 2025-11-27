import type supertest from 'supertest';

export default function testAuthHeader(
  requestFactory: () => supertest.Test,
): void {
  it('should respond with 401 when not authenticated', async () => {
    const response = await requestFactory();

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBeDefined();
  });

  it('should respond with 401 with a malformed token', async () => {
    const response = await requestFactory().set(
      'Authorization',
      'Bearer INVALID TOKEN',
    );

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBeDefined();
  });
}
