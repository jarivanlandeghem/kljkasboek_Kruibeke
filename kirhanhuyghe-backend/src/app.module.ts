import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DrizzleModule } from './drizzle/drizzle.module';
import { TransactiesModule } from './transacties/transacties.module';
import { CategorieenModule } from './categorieen/categorieen.module';
import configuration from './config/configuration';
import { LoggerMiddleware } from './lib/logger.middleware';
import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { SessionModule } from './session/session.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/guards/auth.guard';
import { MailModule } from './mail/mail.module';
import { LeidingprofielModule } from './leidingprofiel/leidingprofiel.module';
import { EvenementenModule } from './evenementen/evenementen.module';
import { AanwezighedenModule } from './aanwezigheden/aanwezigheden.module';
import { HealthModule } from './health/health.module';
import { RondeModule } from './ronde/ronde.module';
import { KasjesModule } from './kasjes/kasjes.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    // Favicon configuratie
    ServeStaticModule.forRoot({
      rootPath: join(
        __dirname,
        '..',
        '..',
        'frontendweb-2526-kirhanhuyghe',
        'kirhanhuyghe-frontend',
        'public',
      ),
      serveRoot: '/',
    }),
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    DrizzleModule,
    TransactiesModule,
    CategorieenModule,
    UserModule,
    AuthModule,
    SessionModule,
    MailModule,
    LeidingprofielModule,
    EvenementenModule,
    AanwezighedenModule,
    RondeModule,
    KasjesModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
