// src/mail/mail.module.ts
import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          service: 'gmail',
          family: 4,
          auth: {
            type: 'OAuth2',
            user: config.get<string>('MAIL_USER'),
            clientId: config.get<string>('GOOGLE_CLIENT_ID'),
            clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET'),
            refreshToken: config.get<string>('GOOGLE_REFRESH_TOKEN'),
          },
        },
        defaults: {
          from: `"KLJ Kasboek" <${config.get<string>('MAIL_USER')}>`,
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
