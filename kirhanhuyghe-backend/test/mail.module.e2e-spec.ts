import { Test } from '@nestjs/testing';
import { MailModule } from '../src/mail/mail.module';
import { ConfigModule } from '@nestjs/config';

describe('MailModule factory (e2e unit)', () => {
  const OLD_ENV = process.env;

  afterEach(() => {
    process.env = { ...OLD_ENV };
  });

  it('builds MailModule with test transport when NODE_ENV=test', async () => {
    process.env.NODE_ENV = 'test';
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), MailModule],
    }).compile();
    expect(moduleRef).toBeDefined();
    await moduleRef.close();
  });

  it('builds MailModule with SMTP transport when NODE_ENV!=test and ConfigService provides secrets', async () => {
    process.env.NODE_ENV = 'production';
    const mockConfig = {
      get: (key: string) => {
        const map: Record<string, string> = {
          MAIL_USER: 'me@example.com',
          GOOGLE_CLIENT_ID: 'cid',
          GOOGLE_CLIENT_SECRET: 'csecret',
          GOOGLE_REFRESH_TOKEN: 'rtok',
          NODE_ENV: 'production',
        };
        return map[key];
      },
    };

    process.env.NODE_ENV = 'production';
    process.env.MAIL_USER = 'me@example.com';
    process.env.GOOGLE_CLIENT_ID = 'cid';
    process.env.GOOGLE_CLIENT_SECRET = 'csecret';
    process.env.GOOGLE_REFRESH_TOKEN = 'rtok';

    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), MailModule],
    }).compile();

    expect(moduleRef).toBeDefined();
    await moduleRef.close();
  });
});
