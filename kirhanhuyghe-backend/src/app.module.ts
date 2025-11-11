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

@Module({
  imports: [
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
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard, // 👈
    },

    // ... andere providers
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 👈 1
    consumer.apply(LoggerMiddleware).forRoutes('*'); // 👈 2
  }
}
