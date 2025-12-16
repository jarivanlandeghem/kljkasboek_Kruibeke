import configFactory from '../src/config/configuration';

describe('configuration factory', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    // clear any keys we will set in tests
    delete process.env.CORS_ORIGINS;
    delete process.env.CORS_MAX_AGE;
    delete process.env.LOG_LEVELS;
    delete process.env.LOG_DISABLED;
    delete process.env.PORT;
    delete process.env.NODE_ENV;
    delete process.env.AUTH_HASH_LENGTH;
    delete process.env.AUTH_JWT_EXPIRATION_INTERVAL;
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('returns sensible defaults when no env vars set', () => {
    const cfg = configFactory();

    expect(cfg.env).toBe('development');
    expect(cfg.port).toBe(3000);
    expect(cfg.cors.origins).toEqual([]);
    expect(cfg.cors.maxAge).toBe(3 * 60 * 60);
    expect(cfg.log.levels).toEqual(['log', 'error', 'warn']);
    expect(cfg.log.disabled).toBe(false);
    expect(cfg.auth.hashLength).toBe(32);
    expect(cfg.auth.jwt.expirationInterval).toBe(3600);
  });

  it('parses provided env values and JSON lists', () => {
    process.env.NODE_ENV = 'production';
    process.env.PORT = '8080';
    process.env.CORS_ORIGINS = JSON.stringify([
      'https://example.com',
      'http://localhost:3000',
    ]);
    process.env.CORS_MAX_AGE = '600';
    process.env.LOG_LEVELS = JSON.stringify(['debug', 'verbose']);
    process.env.LOG_DISABLED = 'true';
    process.env.AUTH_HASH_LENGTH = '64';
    process.env.AUTH_JWT_EXPIRATION_INTERVAL = '7200';

    const cfg = configFactory();

    expect(cfg.env).toBe('production');
    expect(cfg.port).toBe(8080);
    expect(cfg.cors.origins).toEqual([
      'https://example.com',
      'http://localhost:3000',
    ]);
    expect(cfg.cors.maxAge).toBe(600);
    expect(cfg.log.levels).toEqual(['debug', 'verbose']);
    expect(cfg.log.disabled).toBe(true);
    expect(cfg.auth.hashLength).toBe(64);
    expect(cfg.auth.jwt.expirationInterval).toBe(7200);
  });

  it("treats an explicit '0' jwt expiration as falsy and falls back to default", () => {
    process.env.AUTH_JWT_EXPIRATION_INTERVAL = '0';

    const cfg = configFactory();

    // Number('0') === 0 -> falsy -> should fall back to 3600
    expect(cfg.auth.jwt.expirationInterval).toBe(3600);
  });

  it('uses provided database and auth numeric/string envs', () => {
    process.env.DATABASE_URL = 'mysql://test-db:3306/test';
    process.env.AUTH_HASH_TIME_COST = '10';
    process.env.AUTH_HASH_MEMORY_COST = '131072';
    process.env.AUTH_JWT_SECRET = 'supersecret';
    process.env.AUTH_JWT_AUDIENCE = 'my-audience';
    process.env.AUTH_JWT_ISSUER = 'my-issuer';

    const cfg = configFactory();

    expect(cfg.database.url).toBe('mysql://test-db:3306/test');
    expect(cfg.auth.timeCost).toBe(10);
    expect(cfg.auth.memoryCost).toBe(131072);
    expect(cfg.auth.jwt.secret).toBe('supersecret');
    expect(cfg.auth.jwt.audience).toBe('my-audience');
    expect(cfg.auth.jwt.issuer).toBe('my-issuer');
  });
});

describe('configuration factory', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    // clear relevant vars
    delete process.env.CORS_ORIGINS;
    delete process.env.CORS_MAX_AGE;
    delete process.env.LOG_LEVELS;
    delete process.env.LOG_DISABLED;
    delete process.env.MAIL_USER;
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    delete process.env.GOOGLE_REFRESH_TOKEN;
    delete process.env.AUTH_HASH_LENGTH;
    delete process.env.AUTH_JWT_EXPIRATION_INTERVAL;
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('returns sensible defaults when env not set', () => {
    const cfg = configFactory();
    expect(cfg.env).toBe('development');
    expect(cfg.port).toBe(3000);
    expect(cfg.cors.origins).toEqual([]);
    expect(cfg.cors.maxAge).toBeGreaterThan(0);
    expect(cfg.mail.from).toBeDefined();
    expect(cfg.log.disabled).toBe(false);
    expect(cfg.auth.hashLength).toBe(32);
  });

  it('parses CORS origins and max age from env', () => {
    process.env.CORS_ORIGINS = JSON.stringify(['https://a', 'https://b']);
    process.env.CORS_MAX_AGE = '600';
    const cfg = configFactory();
    expect(cfg.cors.origins).toEqual(['https://a', 'https://b']);
    expect(cfg.cors.maxAge).toBe(600);
  });

  it('parses log levels and disabled flag', () => {
    process.env.LOG_LEVELS = JSON.stringify(['debug', 'verbose']);
    process.env.LOG_DISABLED = 'true';
    const cfg = configFactory();
    expect(cfg.log.levels).toEqual(['debug', 'verbose']);
    expect(cfg.log.disabled).toBe(true);
  });

  it('reads mail and auth numeric env vars', () => {
    process.env.MAIL_USER = 'me@example.com';
    process.env.GOOGLE_CLIENT_ID = 'cid';
    process.env.GOOGLE_CLIENT_SECRET = 'csecret';
    process.env.GOOGLE_REFRESH_TOKEN = 'rtok';
    process.env.AUTH_HASH_LENGTH = '16';
    process.env.AUTH_JWT_EXPIRATION_INTERVAL = '7200';
    const cfg = configFactory();
    expect(cfg.mail.user).toBe('me@example.com');
    expect(cfg.auth.hashLength).toBe(16);
    expect(cfg.auth.jwt.expirationInterval).toBe(7200);
  });
});
