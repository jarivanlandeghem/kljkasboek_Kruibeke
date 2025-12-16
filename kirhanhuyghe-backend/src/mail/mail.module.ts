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
        // Use a lightweight JSON transport during tests to avoid real
        // SMTP connections and noisy nodemailer debug output.
        ...(process.env.NODE_ENV === 'test' || config.get<string>('NODE_ENV') === 'test'
          ? {
              transport: {
                jsonTransport: true,
              },
            }
          : {
              transport: {
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                family: 4,
                auth: {
                  type: 'OAuth2',
                  user: config.get<string>('MAIL_USER'),
                  clientId: config.get<string>('GOOGLE_CLIENT_ID'),
                  clientSecret: config.get<string>('GOOGLE_CLIENT_SECRET'),
                  refreshToken: config.get<string>('GOOGLE_REFRESH_TOKEN'),
                },
                debug: false,
                logger: false,
                connectionTimeout: 20000,
                greetingTimeout: 20000,
                socketTimeout: 20000,
                tls: {
                  rejectUnauthorized: false,
                },
              },
            }),
        defaults: {
          from: `"KLJ Portaal" <${config.get<string>('MAIL_USER')}>`,
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
