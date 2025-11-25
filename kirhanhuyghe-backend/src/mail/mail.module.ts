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
          auth: {
            type: 'OAuth2',
            user: config.get<string>('mail.user'),
            clientId: config.get<string>('mail.clientId'),
            clientSecret: config.get<string>('mail.clientSecret'),
            refreshToken: config.get<string>('mail.refreshToken'),
          },
        },
        defaults: {
          from: `"KLJ Kasboek" <${config.get<string>('mail.user')}>`,
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
