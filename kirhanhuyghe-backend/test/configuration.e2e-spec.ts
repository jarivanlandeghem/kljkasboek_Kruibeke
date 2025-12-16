import configFactory from '../src/config/configuration';

describe('configuration factory (e2e unit)', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
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

  it('uses default log levels and disabled=false when not set', () => {
    delete process.env.LOG_LEVELS;
    delete process.env.LOG_DISABLED;
    const cfg = configFactory();
    expect(cfg.log.levels).toEqual(['log', 'error', 'warn']);
    expect(cfg.log.disabled).toBe(false);
  });

  it('falls back to default jwt expiration when AUTH_JWT_EXPIRATION_INTERVAL is 0', () => {
    process.env.AUTH_JWT_EXPIRATION_INTERVAL = '0';
    const cfg = configFactory();
    expect(cfg.auth.jwt.expirationInterval).toBe(3600);
  });

  it('returns defaults when CORS env not set', () => {
    delete process.env.CORS_ORIGINS;
    delete process.env.CORS_MAX_AGE;
    const cfg = configFactory();
    expect(cfg.cors.origins).toEqual([]);
    expect(cfg.cors.maxAge).toBeGreaterThan(0);
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
describe('configuration function', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('returns defaults when no env set', () => {
    delete process.env.CORS_ORIGINS;
    delete process.env.CORS_MAX_AGE;
    const config = require('../src/config/configuration').default();
    expect(config.env).toBe(process.env.NODE_ENV || 'development');
    expect(config.port).toBe(3000);
    expect(Array.isArray(config.cors.origins)).toBeTruthy();
  });

  it('parses CORS_ORIGINS and LOG_LEVELS correctly', () => {
    process.env.CORS_ORIGINS = JSON.stringify(['http://a']);
    process.env.CORS_MAX_AGE = '1234';
    process.env.LOG_LEVELS = JSON.stringify(['log','error']);
    process.env.LOG_DISABLED = 'true';

    const config = require('../src/config/configuration').default();
    expect(config.cors.origins).toEqual(['http://a']);
    expect(config.cors.maxAge).toBe(1234);
    expect(config.log.disabled).toBe(true);
  });

  it('parses auth numbers and jwt defaults', () => {
    process.env.AUTH_HASH_LENGTH = '16';
    process.env.AUTH_HASH_TIME_COST = '3';
    process.env.AUTH_HASH_MEMORY_COST = '1024';
    process.env.AUTH_JWT_EXPIRATION_INTERVAL = '999';
    const config = require('../src/config/configuration').default();
    expect(config.auth.hashLength).toBe(16);
    expect(config.auth.timeCost).toBe(3);
    expect(config.auth.memoryCost).toBe(1024);
    expect(config.auth.jwt.expirationInterval).toBe(999);
  });
});
